using System.Collections.Generic;

namespace StableMarriage
{
    public class Reviewer
    {
        public Professional Professional { get; set; }

        public Queue<Initiator> WishList { get; set; }

        public Reviewer(Professional professional)
        {
            Professional = professional;
            WishList = new Queue<Initiator>();
        }
    }
}
