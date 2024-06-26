import Arweave from 'arweave';
import type { createTransactionParamsTuple, signParamsTuple } from './index.d';

export const ARConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
};

// submit data to AR
export const submitDataToAR = async (arweave: Arweave, data: string | Uint8Array | ArrayBuffer, wallet: any) => {
  let createTransactionParams: createTransactionParamsTuple = [
    {
      data: data
    }
  ];
  let signParams: signParamsTuple = [undefined];
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // This is Node.js
    createTransactionParams[1] = wallet;
    signParams[1] = wallet;
  }
  // Create a data transaction
  let transaction = await arweave.createTransaction(...createTransactionParams);
  signParams[0] = transaction;
  // Optional. Add tags to a transaction
  // GraphQL uses tags when searching for transactions.
  transaction.addTag('Type', 'PADO-EncryptedData');

  // Sign a transaction
  await arweave.transactions.sign(...signParams);

  // Submit a transaction
  // {
  //   // way1: for small
  //   const response = await arweave.transactions.post(transaction);
  //   console.log(`response.status: ${response.status}`);
  // }

  // way2: for big
  let uploader = await arweave.transactions.getUploader(transaction);
  while (!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  }

  return transaction.id;
};

export const getDataFromAR = async (arweave: Arweave, transactionId: string): Promise<Uint8Array> => {
  const res = (await arweave.transactions.getData(transactionId, { decode: true })) as Uint8Array;
  return res;
};
