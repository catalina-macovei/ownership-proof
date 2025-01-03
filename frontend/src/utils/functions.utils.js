import { CONTENT_MANAGER, LICENCE_MANAGER } from '../constants'

const ethers = require('ethers');

const ContentManager = require('../artifacts/contracts/ContentManager.sol/ContentManager.json');
const LicenceManager = require('../artifacts/contracts/LicenceManager.sol/LicenceManager.json');


export const instantiateContracts = async (sdk) => {
    if (!sdk) return;
    
        const ethereum = sdk.getProvider();

        if (ethereum) {
            const provider = new ethers.BrowserProvider(ethereum); 
            try {
                const signer = await provider.getSigner();

                const c1 = new ethers.Contract(
                    CONTENT_MANAGER,
                    ContentManager.abi,
                    signer);

                const c2 = new ethers.Contract(
                    LICENCE_MANAGER,
                    LicenceManager.abi,
                    signer);

                return {
                    contentManager: c1,
                    licenceManager: c2
                }

            } catch (error) {
                console.error(error);
                console.error('User denied account access');
            }
        } else {
            alert('MetaMask is not installed');
        }
    };
