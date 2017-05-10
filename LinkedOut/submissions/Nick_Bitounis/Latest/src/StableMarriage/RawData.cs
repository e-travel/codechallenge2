using System.Collections.Generic;

namespace StableMarriage
{
    public class RawData
    {
        public Dictionary<string, Initiator> RawInitiators { get; set; }
        public Dictionary<string, Reviewer> RawReviewers { get; set; }

        public RawData()
        {
            RawInitiators = new Dictionary<string, Initiator>();
            RawReviewers = new Dictionary<string, Reviewer>();
        }
    }
}
