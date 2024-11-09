import * as Client from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import * as Proof from '@web3-storage/w3up-client/proof';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';

export class W3client {
    constructor() {
        this.client = null;
    }

    async init() {
        // client cu PK specificat in .env
        const principal = Signer.parse(process.env.KEY);
        const store = new StoreMemory();
        this.client = await Client.create({ principal, store });

        // proof de UCAN - drepturi de upload
        const proof = await Proof.parse(process.env.PROOF);
        const space = await this.client.addSpace(proof); 
        await this.client.setCurrentSpace(space.did());
    }
};

export default W3client;