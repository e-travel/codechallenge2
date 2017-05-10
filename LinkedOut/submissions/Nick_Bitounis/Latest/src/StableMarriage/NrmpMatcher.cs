using System.Collections.Generic;

namespace StableMarriage
{
    public class NrmpMatcher
    {
        public void NrmpMatch(HashSet<Initiator> companies, HashSet<Reviewer> reviewers)
        {
            var queue = new Queue<Reviewer>(reviewers);
            while (queue.Count > 0)
            {
                var reviewer = queue.Dequeue();
                while (true)
                {
                    Initiator wish = null;
                    while (wish == null)
                    {
                        wish = reviewer.WishList.Dequeue();
                        if (wish.PositionsToFill <= 0)
                        {
                            wish = null;
                        }
                    }

                    var wishIndex = wish.WishList[reviewer.Professional.Name];

                    // Best match?
                    if (wishIndex + 1 == wish.Permanent.Count + 1)
                    {
                        wish.PositionsToFill -= 1;
                        wish.Permanent.Add(reviewer, wishIndex);
                        break;
                    }
                    else
                    {
                        // Is there room?
                        if (wish.Tentative.Count < wish.PositionsToFill)
                        {
                            wish.Tentative.Add(wishIndex, reviewer);
                            break;
                        }
                        else
                        {
                            // Can we displace someone?
                            var last = wish.Tentative.Keys[wish.Tentative.Count - 1];
                            if (wishIndex < last)
                            {
                                queue.Enqueue(wish.Tentative[last]);
                                wish.Tentative.Remove(last);
                                wish.Tentative.Add(wishIndex, reviewer);
                                break;
                            }

                            // Else, next initiator.
                        }
                    }
                }
            }
        }
    }
}
