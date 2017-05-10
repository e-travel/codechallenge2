using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace StableMarriage
{
    public class Program
    {
        public const int MaxParallels = 4;
        public static Queue<StringSplitter> Splitters = new Queue<StringSplitter>();

        public static void Main(string[] args)
        {
            // It probably does not make sense to thread two
            // separate tasks that do file reading because
            // we are bound to thrash the disk (unless it's
            // an SSD - no way of knowing).
            //
            // So, read the first file completely and then
            // spawn a task that reads and splits the other one
            // into separate lines, while we do other useful work.
            var companiesReader = new DataFileReader();
            companiesReader.ReadFile(args[0], false);

            var professionalsReader = new DataFileReader();
            professionalsReader.ReadFile(args[1], true);

            var raw = new RawData();
            ReadCompanies(companiesReader.Stream, raw);

            Task.WaitAll(professionalsReader.ReadTask);

            ReadProfessionals(professionalsReader.Lines, raw);

            var ordered = Order(raw);

            var gsm = new NrmpMatcher();
            gsm.NrmpMatch(ordered.Initiators, ordered.Reviewers);

            var results = Status(ordered.Initiators);

            using (var sw = new StreamWriter(File.OpenWrite(args[2])))
            {
                foreach (var k in results.Keys)
                {
                    var s = results[k].Aggregate(string.Empty, (current, v) => current + v.Name.Trim() + ",");
                    s = $"{k.Name}: {s.Substring(0, s.Length - 1)}";
                    sw.WriteLine(s);
                }
                sw.Flush();
            }
        }

        private static Dictionary<Company, List<Professional>> Status(HashSet<Initiator> initiators)
        {
            var dic = new Dictionary<Company, List<Professional>>();
            using (var e = initiators.GetEnumerator())
            {
                while (e.MoveNext())
                {
                    var lst = e.Current.Permanent.Select(k => k.Key.Professional).ToList();
                    lst.AddRange(e.Current.Tentative.Select(k => k.Value.Professional));
                    dic.Add(e.Current.Company, lst);
                }
                return dic;
            }
        }

        private static OrderedData Order(RawData raw)
        {
            var ordered = new OrderedData();
            var x = raw.RawInitiators.OrderByDescending(pair => pair.Value.PositionsToFill).Take(raw.RawReviewers.Count);
            using (var en = x.GetEnumerator())
            {
                while (en.MoveNext())
                {
                    ordered.Initiators.Add(en.Current.Value);
                }
            }
            foreach (var reviewer in raw.RawReviewers.Values)
            {
                ordered.Reviewers.Add(reviewer);
            }
            return ordered;
        }

        private static void ReadProfessionals(List<string> lines , RawData raw)
        {
            for (var i = 1; i <= MaxParallels; i++)
            {
                Splitters.Enqueue(new StringSplitter(400000));
            }

            Parallel.ForEach(lines, new ParallelOptions {MaxDegreeOfParallelism = MaxParallels}, x => ProcessOneProfessional(x, raw));
        }

        private static void ProcessOneProfessional(string line, RawData raw)
        {
            // We don't want to keep creating new splitters, 
            // so we'll just peel one off the queue and return
            // it there after we're done.
            StringSplitter splitter;
            lock (Splitters)
            {
                splitter = Splitters.Dequeue();
            }
            
            splitter.SafeSplit(line, new[] { ',' }, StringSplitOptions.None);
            var spl = splitter.Results;
            var dual = spl[0].Split(new[] { ":" }, StringSplitOptions.RemoveEmptyEntries);

            var professionalName = dual[0];
            var reviewer = raw.RawReviewers[professionalName];

            reviewer.WishList.Enqueue(raw.RawInitiators[dual[1]]);

            for (var i = 1; i < spl.Length; i++)
            {
                if (string.IsNullOrEmpty(spl[i]))
                {
                    break;
                }
                reviewer.WishList.Enqueue(raw.RawInitiators[spl[i]]);
            }

            lock (Splitters)
            {
                Splitters.Enqueue(splitter);
            }
        }

        private static void ReadCompanies(MemoryStream stream, RawData raw)
        {
            var splitter = new StringSplitter(400000);
            using (var sr = new StreamReader(stream))
            {
                while (!sr.EndOfStream)
                {
                    var line = sr.ReadLine();
                    if (string.IsNullOrEmpty(line))
                    {
                        continue;
                    }

                    splitter.SafeSplit(line, new[] {','}, StringSplitOptions.None);
                    var spl = splitter.Results;
                    var dual = spl[1].Split(new[] { ":" }, StringSplitOptions.RemoveEmptyEntries);
                    var initiator = new Initiator(new Company(dual[0].Trim()), Convert.ToInt32(spl[0]));

                    var reviewer = GetOrCreateReviewer(dual[1].Trim(), raw.RawReviewers);

                    initiator.WishList.Add(reviewer.Professional.Name, initiator.WishList.Count);

                    for (var i = 2; i < spl.Length; i++)
                    {
                        if (string.IsNullOrEmpty(spl[i]))
                        {
                            break;
                        }
                        reviewer = GetOrCreateReviewer(spl[i].Trim(), raw.RawReviewers);
                        initiator.WishList.Add(reviewer.Professional.Name, initiator.WishList.Count);
                    }

                    raw.RawInitiators.Add(initiator.Company.Name, initiator);
                }
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static Reviewer GetOrCreateReviewer(string professionalName, Dictionary<string, Reviewer> reviewers)
        {
            Reviewer reviewer;
            if (reviewers.TryGetValue(professionalName, out reviewer))
            {
                return reviewer;
            }
            reviewer = new Reviewer(new Professional(professionalName));
            reviewers.Add(reviewer.Professional.Name, reviewer);
            return reviewer;
        }
    }
}