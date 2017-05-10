using System.Collections.Generic;

namespace StableMarriage
{
    public class Initiator
    {
        public Company Company { get; set; }

        public Dictionary<string, int> WishList { get; set; } 

        public int PositionsToFill { get; set; }

        public SortedList<Reviewer, int> Permanent { get; set; }

        public SortedList<int, Reviewer> Tentative { get; set; }

        public Initiator(Company company, int positionsToFill)
        {
            Company = company;
            PositionsToFill = positionsToFill;
            WishList = new Dictionary<string, int>(10000);
            Permanent = new SortedList<Reviewer, int>();
            Tentative = new SortedList<int, Reviewer>();
        }
    }
}
