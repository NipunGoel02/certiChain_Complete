  // src/pages/Certificate.jsx

  import React, { useState, useEffect, useRef } from 'react';
  import { useParams, Link } from 'react-router-dom';
  import { motion } from 'framer-motion';
  import { ethers } from 'ethers';
  import axios from 'axios';
  import html2canvas from 'html2canvas';
  import { useAuth } from '../Context/AuthContext';

  // ======================================================
  // PINATA CONFIG
  // IMPORTANT: Production mein API secret frontend mein mat rakho.
  // ======================================================

  const PINATA_API_KEY = '073a6be7ca3053e2f986';
  const PINATA_API_SECRET =
    'e124cf0ef9fdfb9e9409e69e058bcb129320abdc68c0aab97972a8dd9e4d2c4a';

  const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL ||
    'https://nft-project-2y3b.onrender.com';


  // ======================================================
  // CONTRACT
  // ======================================================

  const CONTRACT_ADDRESS =
    '0xA30C990fcda532F85CA3C52c744A373F71FF0299';


  // ======================================================
  // SEPOLIA RPC
  // ======================================================

  const ALCHEMY_RPC =
    'https://eth-sepolia.g.alchemy.com/v2/KEHv5HPcKJIvIiVjyPrJR';


  // ======================================================
  // CONTRACT ABI
  // Sirf required functions rakhe gaye hain.
  // ======================================================

  const CONTRACT_ABI = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'string',
          name: 'tokenURI',
          type: 'string',
        },
      ],
      name: 'mintCertificate',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },

    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'tokenURI',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'ownerOf',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];


  // ======================================================
  // PINATA IMAGE UPLOAD
  // ======================================================

  const uploadImageToPinata = async (canvas) => {
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Certificate image create nahi ho saki.');
    }

    const formData = new FormData();

    formData.append(
      'file',
      blob,
      `certificate-${Date.now()}.png`
    );

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,

        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    const imageCID = response.data.IpfsHash;

    if (!imageCID) {
      throw new Error('Pinata ne image CID return nahi ki.');
    }

    console.log('=================================');
    console.log('IMAGE CID:', imageCID);
    console.log(
      'IMAGE URL:',
      `${PINATA_GATEWAY}/${imageCID}`
    );
    console.log('=================================');

    // Keep the image as an IPFS URI in NFT metadata so wallets can resolve it
    // through their own IPFS gateway instead of depending on one HTTP gateway.
    return `ipfs://${imageCID}`;
  };


  // ======================================================
  // PINATA METADATA UPLOAD
  // ======================================================

  const uploadMetadataToPinata = async (metadata) => {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    const metadataCID = response.data.IpfsHash;

    if (!metadataCID) {
      throw new Error('Pinata ne metadata CID return nahi kiya.');
    }

    console.log('=================================');
    console.log('METADATA CID:', metadataCID);
    console.log(
      'METADATA URL:',
      `${PINATA_GATEWAY}/${metadataCID}`
    );
    console.log('=================================');

    // Contract mein IPFS URI store karenge.
    return `ipfs://${metadataCID}`;
  };


  // ======================================================
  // CERTIFICATE COMPONENT
  // ======================================================

  const Certificate = () => {
    const { courseId } = useParams();

    const { currentUser } = useAuth();

    const [course, setCourse] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [isConnectingWallet, setIsConnectingWallet] =
      useState(false);

    const [walletConnected, setWalletConnected] =
      useState(false);

    const [walletAddress, setWalletAddress] =
      useState('');

    const [isMinting, setIsMinting] =
      useState(false);

    const [isMinted, setIsMinted] =
      useState(false);

    const [transactionHash, setTransactionHash] =
      useState('');

    const [tokenURI, setTokenURI] =
      useState('');

    const certificateRef = useRef(null);


    // ====================================================
    // DATE
    // ====================================================

    const currentDate = new Date().toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );


    // ====================================================
    // FETCH COURSE
    // ====================================================

    useEffect(() => {
      const fetchCourse = async () => {
        try {
          setLoading(true);

          const response = await axios.get(
            `${API_BASE_URL}/api/courses/${courseId}`
          );

          setCourse(response.data);

          setLoading(false);
        } catch (err) {
          console.error(
            'Failed to load course:',
            err
          );

          setError(
            'Failed to load certificate data'
          );

          setLoading(false);
        }
      };

      fetchCourse();
    }, [courseId]);


    // ====================================================
    // CONNECT WALLET
    // ====================================================

    const handleConnectWallet = async () => {
      setIsConnectingWallet(true);

      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error(
            'MetaMask is not installed. Please install MetaMask.'
          );
        }

        // Request account
        const accounts =
          await window.ethereum.request({
            method: 'eth_requestAccounts',
          });

        if (!accounts || accounts.length === 0) {
          throw new Error(
            'No MetaMask account found.'
          );
        }

        const address = accounts[0];


        // ==================================================
        // CHECK SEPOLIA
        // ==================================================

        let chainId =
          await window.ethereum.request({
            method: 'eth_chainId',
          });

        if (chainId !== '0xaa36a7') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                },
              ],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',

                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'SEP',
                      decimals: 18,
                    },

                    rpcUrls: [
                      ALCHEMY_RPC,
                    ],

                    blockExplorerUrls: [
                      'https://sepolia.etherscan.io',
                    ],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }

          // Network switch ke baad dobara check
          chainId =
            await window.ethereum.request({
              method: 'eth_chainId',
            });

          if (chainId !== '0xaa36a7') {
            throw new Error(
              'Please switch MetaMask to Sepolia network.'
            );
          }
        }


        // ==================================================
        // SAVE WALLET
        // ==================================================

        setWalletAddress(address);

        try {
          const token =
            localStorage.getItem('token');

          await axios.patch(
            `${API_BASE_URL}/api/auth/wallet`,
            {
              walletAddress: address,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(
            'Wallet address saved successfully'
          );
        } catch (err) {
          console.error(
            'Failed to save wallet:',
            err
          );

          // Wallet connection ko fail nahi karenge.
          alert(
            'Wallet connected, but wallet address backend mein save nahi hua.'
          );
        }

        setWalletConnected(true);

      } catch (err) {
        console.error(
          'Wallet connection error:',
          err
        );

        alert(
          err.message ||
          'Failed to connect wallet.'
        );

      } finally {
        setIsConnectingWallet(false);
      }
    };


    // ====================================================
    // MINT NFT
    // ====================================================

    const handleMintNFT = async () => {
      if (!walletConnected) {
        alert(
          'Please connect your wallet first.'
        );
        return;
      }

      if (!walletAddress) {
        alert(
          'Wallet address missing.'
        );
        return;
      }

      if (!course) {
        alert(
          'Course data not loaded yet.'
        );
        return;
      }

      if (!certificateRef.current) {
        alert(
          'Certificate element not found.'
        );
        return;
      }

      setIsMinting(true);

      try {

        // ==================================================
        // CHECK METAMASK
        // ==================================================

        if (
          typeof window.ethereum === 'undefined'
        ) {
          throw new Error(
            'MetaMask is not installed.'
          );
        }


        // ==================================================
        // CHECK NETWORK
        // ==================================================

        const chainId =
          await window.ethereum.request({
            method: 'eth_chainId',
          });

        if (chainId !== '0xaa36a7') {
          throw new Error(
            'Please switch MetaMask to Sepolia network.'
          );
        }


        // ==================================================
        // STEP 1
        // CERTIFICATE -> CANVAS
        // ==================================================

        console.log(
          'Creating certificate image...'
        );

        const canvas =
          await html2canvas(
            certificateRef.current,
            {
              useCORS: true,

              allowTaint: false,

              backgroundColor: '#ffffff',

              scale: 2,

              logging: false,
            }
          );


        // ==================================================
        // STEP 2
        // IMAGE -> PINATA
        // ==================================================

        console.log(
          'Uploading certificate image to Pinata...'
        );

        const imageURI =
          await uploadImageToPinata(
            canvas
          );

        console.log(
          'FINAL IMAGE URI:',
          imageURI
        );


        // ==================================================
        // STEP 3
        // CREATE NFT METADATA
        // ==================================================

        const metadata = {
          name: `${course.title} Certificate`,

          description:
            `Certificate for completing ${course.title}`,

          image: imageURI,

          attributes: [
            {
              trait_type: 'Course',
              value: course.title,
            },

            {
              trait_type: 'Recipient',
              value:
                currentUser?.name ||
                'User',
            },

            {
              trait_type: 'Date',
              value: currentDate,
            },
          ],
        };


        console.log(
          'NFT METADATA:',
          metadata
        );


        // ==================================================
        // STEP 4
        // METADATA -> PINATA
        // ==================================================

        console.log(
          'Uploading metadata to Pinata...'
        );

        const finalTokenURI =
          await uploadMetadataToPinata(
            metadata
          );


        console.log(
          'FINAL TOKEN URI:',
          finalTokenURI
        );

        setTokenURI(
          finalTokenURI
        );


        // ==================================================
        // STEP 5
        // CREATE METAMASK PROVIDER
        // ==================================================

        const browserProvider =
          new ethers.BrowserProvider(
            window.ethereum
          );

        const signer =
          await browserProvider.getSigner();


        // ==================================================
        // VERIFY SIGNER
        // ==================================================

        const signerAddress =
          await signer.getAddress();

        console.log(
          'Signer:',
          signerAddress
        );


        // ==================================================
        // CONTRACT
        // ==================================================

        const contract =
          new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );


        // ==================================================
        // VERIFY CONTRACT NETWORK
        // ==================================================

        const network =
          await browserProvider.getNetwork();

        console.log(
          'Network:',
          network
        );


        if (
          network.chainId !== 11155111n
        ) {
          throw new Error(
            'Wrong network. Please use Sepolia.'
          );
        }


        // ==================================================
        // STEP 6
        // MINT NFT
        // ==================================================

        console.log(
          'Minting NFT...'
        );

        console.log(
          'Recipient:',
          walletAddress
        );

        console.log(
          'Token URI:',
          finalTokenURI
        );


        const tx =
          await contract.mintCertificate(
            walletAddress,
            finalTokenURI
          );


        console.log(
          'Transaction sent:',
          tx.hash
        );

        setTransactionHash(
          tx.hash
        );


        // ==================================================
        // STEP 7
        // WAIT CONFIRMATION
        // ==================================================

        console.log(
          'Waiting for blockchain confirmation...'
        );

        const receipt =
          await tx.wait();


        console.log(
          'Transaction confirmed:',
          receipt
        );


        if (
          receipt.status === 1
        ) {
          setIsMinted(true);

          alert(
            'NFT successfully minted! 🎉'
          );
        } else {
          throw new Error(
            'Transaction failed.'
          );
        }

      } catch (err) {

        console.error(
          '================================='
        );

        console.error(
          'NFT MINT ERROR:',
          err
        );

        console.error(
          '================================='
        );

        let message =
          'Failed to mint NFT.';

        if (err?.reason) {
          message = err.reason;
        } else if (err?.shortMessage) {
          message = err.shortMessage;
        } else if (err?.message) {
          message = err.message;
        }

        alert(message);

      } finally {
        setIsMinting(false);
      }
    };


    // ====================================================
    // LOADING
    // ====================================================

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">

          <div className="text-center">

            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-gray-600">
              Loading certificate...
            </p>

          </div>

        </div>
      );
    }


    // ====================================================
    // ERROR
    // ====================================================

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">

          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">

            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600 mb-6">
              {error}
            </p>

            <Link
              to="/courses"
              className="inline-block px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors duration-300"
            >
              Back to Courses
            </Link>

          </div>

        </div>
      );
    }


    // ====================================================
    // MAIN UI
    // ====================================================

    return (
      <div className="cc-certificate-page min-h-screen">

        <div className="container mx-auto px-4 py-8">

          <div className="max-w-4xl mx-auto">

            <div className="bg-white rounded-xl shadow-md p-6 mb-8">

              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Congratulations on Completing the Course!
              </h1>

              <p className="text-gray-600 mb-6">
                You've successfully completed "{course.title}" and earned this certificate.
                Claim it as an NFT on the blockchain for permanent verification and add it to your digital wallet.
              </p>


              {/* ==================================================
                  CERTIFICATE PREVIEW
              ================================================== */}

              <div className="mb-8 p-4 bg-gray-50 rounded-lg">

                <div
                  ref={certificateRef}
                  className="relative bg-white border-8 border-purple-100 rounded-lg p-8 w-full max-w-3xl mx-auto"
                  style={{
                    aspectRatio: '1.4/1',
                  }}
                >

                  <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 rounded-lg m-2 pointer-events-none"></div>


                  {/* TITLE */}

                  <div className="text-center mb-6">

                    <h2 className="text-3xl font-bold text-purple-800 mb-1">
                      Certificate of Completion
                    </h2>

                    <div className="w-40 h-1 bg-purple-500 mx-auto"></div>

                  </div>


                  {/* CONTENT */}

                  <div className="text-center mb-8">

                    <p className="text-lg text-gray-600 mb-2">
                      This is to certify that
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {currentUser?.name || 'User'}
                    </h3>

                    <p className="text-lg text-gray-600">
                      has successfully completed the course
                    </p>

                    <h4 className="text-xl font-bold text-purple-700 mt-2">
                      "{course.title}"
                    </h4>

                  </div>


                  {/* INSTRUCTOR / DATE */}

                  <div className="flex justify-between items-end mt-12">

                    <div className="text-center">

                      <div className="w-40 h-px bg-gray-400 mb-1"></div>

                      <p className="text-gray-600">
                        {course.instructor?.name || 'Instructor'}
                      </p>

                      <p className="text-sm text-gray-500">
                        {course.instructor?.title || 'Instructor'}
                      </p>

                    </div>


                    <div className="text-center">

                      <div className="w-40 h-px bg-gray-400 mb-1"></div>

                      <p className="text-gray-600">
                        Date Issued
                      </p>

                      <p className="text-sm text-gray-500">
                        {currentDate}
                      </p>

                    </div>

                  </div>


                  {/* CERTIFICATE ID */}

                  <div className="absolute bottom-4 right-4 text-xs text-gray-400">

                    Certificate ID:
                    CERT-{courseId}

                  </div>


                  {/* LOGO */}

                  <div className="absolute bottom-4 left-4">

                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <path
                        d="M50 92C73.196 92 92 73.196 92 50C92 26.804 73.196 8 50 8C26.804 8 8 26.804 8 50C8 73.196 26.804 92 50 92Z"
                        stroke="#0D9488"
                        strokeWidth="4"
                      />

                      <path
                        d="M50 75V50M50 50V25M50 50H75M50 50H25"
                        stroke="#0D9488"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                    </svg>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  ACTION BUTTON
              ================================================== */}

              <div className="flex flex-col md:flex-row gap-4 justify-center">

                {!walletConnected ? (

                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet}
                    className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400"
                  >

                    {isConnectingWallet ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>

                        Connecting Wallet...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />

                        </svg>

                        Connect Wallet to Claim NFT
                      </>
                    )}

                  </button>

                ) : !isMinted ? (

                  <button
                    onClick={handleMintNFT}
                    disabled={isMinting}
                    className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400"
                  >

                    {isMinting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>

                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />

                        </svg>

                        Claim as NFT
                      </>
                    )}

                  </button>

                ) : (

                  <button
                    className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg flex items-center justify-center cursor-default"
                  >

                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />

                    </svg>

                    NFT Claimed Successfully

                  </button>

                )}

              </div>

            </div>


            {/* ==================================================
                WALLET & NFT DETAILS
            ================================================== */}

            {walletConnected && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="bg-white rounded-xl shadow-md p-6"
              >

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Wallet & NFT Details
                </h2>


                <div className="space-y-4">


                  {/* WALLET */}

                  <div>

                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Connected Wallet
                    </h3>

                    <div className="flex items-center">

                      <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">

                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />

                        </svg>

                      </div>

                      <span className="text-gray-800 font-medium">

                        {walletAddress
                          ? `${walletAddress.substring(
                              0,
                              6
                            )}...${walletAddress.substring(
                              walletAddress.length - 4
                            )}`
                          : ''}

                      </span>

                    </div>

                  </div>


                  {/* NFT DETAILS */}

                  {isMinted && (

                    <>

                      {/* TRANSACTION */}

                      <div>

                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Transaction Hash
                        </h3>

                        <div className="flex items-center">

                          <a
                            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 transition-colors duration-300 break-all"
                          >

                            {transactionHash
                              ? `${transactionHash.substring(
                                  0,
                                  10
                                )}...${transactionHash.substring(
                                  transactionHash.length - 10
                                )}`
                              : ''}

                            <svg
                              className="w-4 h-4 inline-block ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />

                            </svg>

                          </a>

                        </div>

                      </div>


                      {/* TOKEN URI */}

                      {tokenURI && (

                        <div>

                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            Token URI
                          </h3>

                          <p className="text-sm text-gray-600 break-all">
                            {tokenURI}
                          </p>

                        </div>

                      )}


                      {/* STATUS */}

                      <div>

                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          NFT Status
                        </h3>

                        <div className="flex items-center">

                          <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                            Verified on Blockchain
                          </div>

                        </div>

                      </div>


                      {/* INFO */}

                      <div className="pt-4">

                        <p className="text-gray-600">

                          Your certificate has been permanently recorded on the blockchain as an NFT.
                          This provides immutable proof of your achievement that can be verified by anyone.

                        </p>

                      </div>


                      {/* WALLET INFO */}

                      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">

                        <h3 className="font-medium text-purple-800 mb-2">
                          NFT Added to Your Wallet
                        </h3>

                        <p className="text-gray-600 mb-4">

                          Your NFT certificate has been added to your wallet.
                          You can view it in your wallet's NFT collection.

                        </p>

                        <div className="flex items-center">

                          <svg
                            className="w-5 h-5 text-purple-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />

                          </svg>

                          <span className="text-sm text-purple-600">

                            To view in MetaMask:
                            Open MetaMask → NFTs tab →
                            Your certificate should appear there.

                          </span>

                        </div>

                      </div>

                    </>

                  )}

                </div>

              </motion.div>

            )}

          </div>

        </div>

      </div>
    );
  };

  export default Certificate;
