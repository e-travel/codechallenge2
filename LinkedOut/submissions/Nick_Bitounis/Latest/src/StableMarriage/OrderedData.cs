using System.Collections.Generic;

namespace StableMarriage
{
    public class OrderedData
    {
        public HashSet<Initiator> Initiators { get; set; }
        public HashSet<Reviewer> Reviewers { get; set; }

        public OrderedData()
        {
            Initiators = new HashSet<Initiator>();
            Reviewers = new HashSet<Reviewer>();
        }
    }
}
