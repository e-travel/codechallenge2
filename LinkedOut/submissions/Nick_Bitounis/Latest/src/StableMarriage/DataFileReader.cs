using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace StableMarriage
{
    /// <summary>
    /// Oh, what a deadly web I weave
    /// when to beat Jason I try.
    /// 
    /// The purpose of this is to:
    ///     - Read a file completely in memory if asked to work synchronously.
    ///     - Spawn a thread that reads a file in memory and split it into 
    ///       lines if asked to work in the background.
    /// </summary>
    public class DataFileReader
    {
        public string FileName { get; set; }

        public Task ReadTask { get; set; }

        public List<string> Lines { get; set; }

        public MemoryStream Stream { get; set; }

        public void ReadFile(string fileName, bool background)
        {
            FileName = fileName;
            if (!background)
            {
                ReadFileContents();
            }
            else
            {
                ReadTask = new Task(ProcessTask);
                ReadTask.Start();
            }
        }

        private void ProcessTask()
        {
            ReadFileContents();
            ParseLines();
        }

        private void ReadFileContents()
        {
            Stream = new MemoryStream();
            using (var sr = new StreamReader(File.OpenRead(FileName)))
            {
                sr.BaseStream.CopyTo(Stream);
            }
            Stream.Seek(0, SeekOrigin.Begin);
        }

        private void ParseLines()
        {
            Lines = new List<string>();

            using (var sr = new StreamReader(Stream))
            {
                while (!sr.EndOfStream)
                {
                    var line = sr.ReadLine().Replace(" ", "");
                    if (string.IsNullOrEmpty(line))
                    {
                        continue;
                    }

                    Lines.Add(line);
                }
            }
        }
    }
}
