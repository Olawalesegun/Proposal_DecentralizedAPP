import { Box } from "@radix-ui/themes";
import Layout from "./components/Layout";
import CreateProposalModal from "./components/CreateProposalModal";
import Proposals from "./components/Proposals";
import useContract from "./hooks/useContract";
import { useCallback, useEffect, useState } from "react";

function App() {
    const readOnlyProposalContract = useContract(true);
    const [proposals, setProposals] = useState([]);

    const fetchProposals = useCallback(async () => {
        if (!readOnlyProposalContract) return;
        console.log("proivder: ", readOnlyProposalContract.runner);

        try {
            const proposalCount = Number(
                await readOnlyProposalContract.proposalCount()
            );

            const proposalsId = Array.from(
                { length: proposalCount },
                (_, i) => i + 1
            );

            proposalsId.pop();

            console.log("proposalsId: ", proposalsId);

            proposalsId.forEach(async (proposalId) => {
                const proposalStruct = await readOnlyProposalContract.proposals(
                    proposalId
                );

                setProposals((prev) => [
                    ...prev,
                    {
                        description: proposalStruct.description,
                        amount: proposalStruct.amount,
                        minRequiredVote: proposalStruct.minVotesToPass,
                        votecount: proposalStruct.voteCount,
                        deadline: proposalStruct.votingDeadline,
                        executed: proposalStruct.executed,
                    },
                ]);
            });
        } catch (error) {
            console.log("error fetching proposals: ", error);
        }
    }, [readOnlyProposalContract]);

     const setupEventListener = useCallback(() => {
       if (!readOnlyProposalContract) return;

       readOnlyProposalContract.on(
         "ProposalCreated",
         (
           proposalId,
           description,
           amount,
           minVotesToPass,
           voteCount,
           votingDeadline
         ) => {
           console.log("New proposal created: ", {
             proposalId,
             description,
             amount,
             minVotesToPass,
             voteCount,
             votingDeadline,
           });

           setProposals((prev) => [
             ...prev,
             {
               description,
               amount,
               minRequiredVote: minVotesToPass,
               votecount: voteCount,
               deadline: votingDeadline,
               executed: false,
             },
           ]);
         }
       );

       return () => {
         readOnlyProposalContract.removeAllListeners("ProposalCreated");
       };
     }, [readOnlyProposalContract]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);
  
    useEffect(() => {
      setupEventListener();
    }, [setupEventListener]);

    return (
        <Layout>
            <Box className="flex justify-end p-4">
                <CreateProposalModal />
            </Box>
            <Proposals />
        </Layout>
    );
}

export default App;
