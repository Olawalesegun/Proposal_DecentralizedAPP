import { toast } from "react-toastify";
import useContract from "./useContract";

const useVote = () => {
  const contract = useContract(true);

  const handleVote = async (id) => {
    try {
      const votingTx = await contract.voteOnProposal(id); 
      const receipt = await votingTx.wait(); 

      if (receipt.status === 1) {
        
        toast.success("Voted successfully!");
      } else {
        toast.error("Transaction failed.");
      }
    } catch (error) {
      toast.error("Error during voting: " + error.message);
    }
  };

  return handleVote;
};

export default useVote;
