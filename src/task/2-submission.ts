import { namespaceWrapper } from '@_koii/namespace-wrapper';

export async function submission(roundNumber: number): Promise<string | void> {
  /**
   * Submit the task proofs for auditing
   * Must return a string of max 512 bytes to be submitted on chain
   */
  try {
    console.log(`MAKE SUBMISSION FOR ROUND ${roundNumber}`);
    const prediction = await namespaceWrapper.storeGet('prediction');
    return prediction ?? '';
  } catch (error) {
    console.error('MAKE SUBMISSION ERROR:', error);
  }
}
