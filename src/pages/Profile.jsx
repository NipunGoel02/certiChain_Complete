import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import axios from 'axios';

import PendingInvitations from './hackathon/PendingInvitations';
import TeamInvitations from './hackathon/TeamInvitations';
import InternshipPendingInvitations from './internship/PendingInvitations';
import { getCourses } from '../services/courseService';

export default function Profile() {
  const { currentUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [registeredHackathons, setRegisteredHackathons] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [coursesMap, setCoursesMap] = useState({});

  // Profile image
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // --------------------------------------------------
  // PROFILE IMAGE
  // --------------------------------------------------

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Instant preview
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        '/api/auth/profile/picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.profilePicture) {
        const backendBaseUrl =
          import.meta.env.VITE_BACKEND_URL ||
          'https://nft-project-2y3b.onrender.com';

        let fullUrl = response.data.profilePicture.startsWith('http')
          ? response.data.profilePicture
          : backendBaseUrl + response.data.profilePicture;

        // Cache bust
        fullUrl += `?t=${Date.now()}`;

        setProfileImage(fullUrl);
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
    }
  };

  // --------------------------------------------------
  // CONNECT WALLET
  // --------------------------------------------------

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask first.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet account found.');
      }

      const address = accounts[0];

      const network = await provider.getNetwork();

      // Sepolia
      if (network.chainId !== 11155111n) {
        alert(
          'Please switch MetaMask to Sepolia Test Network before viewing certificates.'
        );

        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
              },
            ],
          });

          // Refresh provider after network switch
          const refreshedProvider = new ethers.BrowserProvider(
            window.ethereum
          );

          const refreshedAccounts =
            await refreshedProvider.send('eth_accounts', []);

          if (refreshedAccounts.length > 0) {
            const refreshedAddress = refreshedAccounts[0];

            setWalletAddress(refreshedAddress);
            setWalletConnected(true);

            await fetchUserNFTs(refreshedAddress);
          }

          return;
        } catch (switchError) {
          console.error('Failed to switch network:', switchError);

          alert(
            'Please manually switch MetaMask to Sepolia Test Network.'
          );

          return;
        }
      }

      setWalletAddress(address);
      setWalletConnected(true);

      await fetchUserNFTs(address);
    } catch (error) {
      console.error('Wallet connection failed:', error);

      if (error?.code === 4001) {
        alert('Wallet connection was rejected.');
      } else {
        alert(error?.message || 'Failed to connect wallet.');
      }
    }
  };

  // --------------------------------------------------
  // FETCH USER NFTS
  // --------------------------------------------------

 const fetchUserNFTs = async (address) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid wallet address: ${address}`);
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const network = await provider.getNetwork();

    console.log("Connected blockchain:", {
      chainId: network.chainId.toString(),
      networkName: network.name,
    });

    // Sepolia
    if (network.chainId !== 11155111n) {
      throw new Error(
        `Wrong network. Please switch MetaMask to Sepolia. Current chain ID: ${network.chainId}`
      );
    }

    const contractAddress =
      "0xA30C990fcda532F85CA3C52c744A373F71FF0299";

    // KEEP YOUR EXISTING COMPLETE ABI HERE
    const contractABI =[
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721IncorrectOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721InsufficientApproval",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOperator",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721NonexistentToken",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_fromTokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_toTokenId",
                    "type": "uint256"
                }
            ],
            "name": "BatchMetadataUpdate",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "tokenURI",
                    "type": "string"
                }
            ],
            "name": "CertificateMinted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "MetadataUpdate",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "tokenURI",
                    "type": "string"
                }
            ],
            "name": "mintCertificate",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const latestBlock = await provider.getBlockNumber();

    console.log("Latest Sepolia block:", latestBlock);

    // IMPORTANT:
    // Don't scan from block 0.
    // Only scan recent blocks for now.
    const CHUNK_SIZE = 9000;
    const BLOCKS_TO_SCAN = 100000;

    const startBlock = Math.max(
      0,
      latestBlock - BLOCKS_TO_SCAN
    );

    console.log(
      `Scanning NFT transfers from ${startBlock} -> ${latestBlock}`
    );

    const events = [];

    /*
     * ERC721 Transfer event:
     *
     * Transfer(
     *   address indexed from,
     *   address indexed to,
     *   uint256 indexed tokenId
     * )
     *
     * We only search transfers TO the user's wallet.
     */

    const transferTopic = ethers.id(
      "Transfer(address,address,uint256)"
    );

    const walletTopic = ethers.zeroPadValue(address, 32);

    for (
      let fromBlock = startBlock;
      fromBlock <= latestBlock;
      fromBlock += CHUNK_SIZE
    ) {
      const toBlock = Math.min(
        fromBlock + CHUNK_SIZE - 1,
        latestBlock
      );

      console.log(
        `Searching Transfer events: ${fromBlock} -> ${toBlock}`
      );

      try {
        const logs = await provider.getLogs({
          address: contractAddress,
          topics: [
            transferTopic,
            null,
            walletTopic,
          ],
          fromBlock,
          toBlock,
        });

        if (logs.length > 0) {
          console.log(
            `Found ${logs.length} NFT transfer(s)`
          );

          events.push(...logs);
        }
      } catch (error) {
        console.error(
          `Failed querying ${fromBlock}-${toBlock}:`,
          error
        );
      }
    }

    console.log(
      "Total NFT transfer events:",
      events.length
    );

    /*
     * Extract token IDs.
     */
    const tokenIds = [
      ...new Set(
        events.map((log) => {
          try {
            return ethers.toBigInt(log.topics[3]).toString();
          } catch {
            return null;
          }
        }).filter(Boolean)
      ),
    ];

    console.log(
      "Token IDs found:",
      tokenIds
    );

    const nfts = [];

    /*
     * Check current owner.
     */
    for (const tokenId of tokenIds) {
      try {
        const owner = await contract.ownerOf(tokenId);

        if (
          owner.toLowerCase() !== address.toLowerCase()
        ) {
          continue;
        }

        let tokenURI = "";

        try {
          tokenURI = await contract.tokenURI(tokenId);
        } catch (error) {
          console.warn(
            `tokenURI failed for ${tokenId}`,
            error
          );
        }

        let metadata = {};

        try {
          let metadataUrl = tokenURI;

          if (metadataUrl?.startsWith("ipfs://")) {
            metadataUrl = metadataUrl.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );
          }

          if (metadataUrl) {
            const response = await fetch(metadataUrl);

            if (response.ok) {
              metadata = await response.json();
            }
          }
        } catch (error) {
          console.warn(
            `Metadata failed for token ${tokenId}:`,
            error
          );
        }

        nfts.push({
          tokenId,
          tokenURI,
          metadata,
          contract_address: contractAddress,
        });

      } catch (error) {
        console.warn(
          `Could not load NFT ${tokenId}:`,
          error
        );
      }
    }

    console.log(
      "NFTs belonging to wallet:",
      nfts
    );

    setCertificates(nfts);

  } catch (error) {
    console.error("NFT fetch failed:", error);
    setCertificates([]);
  }
};
  // --------------------------------------------------
  // INITIAL DATA
  // --------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts =
            await window.ethereum.request({
              method: 'eth_accounts',
            });

          if (accounts.length > 0) {
            const provider =
              new ethers.BrowserProvider(
                window.ethereum
              );

            const network =
              await provider.getNetwork();

            if (network.chainId === 11155111n) {
              setWalletAddress(accounts[0]);
              setWalletConnected(true);

              await fetchUserNFTs(accounts[0]);
            } else {
              console.warn(
                'Wallet connected but not on Sepolia.'
              );
            }
          }
        } catch (error) {
          console.error(
            'Error checking wallet connection:',
            error
          );
        }
      }
    };

    const fetchRegisteredHackathons = async () => {
      try {
        const token =
          localStorage.getItem('token');

        const response = await axios.get(
          '/api/hackathons/registered',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          setRegisteredHackathons(
            response.data
          );
        } else if (response.data) {
          setRegisteredHackathons([
            response.data,
          ]);
        } else {
          setRegisteredHackathons([]);
        }
      } catch (error) {
        console.error(
          'Failed to fetch registered hackathons:',
          error
        );

        setRegisteredHackathons([]);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const token =
          localStorage.getItem('token');

        if (!token) return;

        const response = await axios.get(
          '/api/auth/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          response.data &&
          response.data.profilePicture
        ) {
          const backendBaseUrl =
            import.meta.env.VITE_BACKEND_URL ||
            'https://nft-project-2y3b.onrender.com';

          let fullUrl =
            response.data.profilePicture.startsWith(
              'http'
            )
              ? response.data.profilePicture
              : backendBaseUrl +
                response.data.profilePicture;

          fullUrl += `?t=${Date.now()}`;

          setProfileImage(fullUrl);
        }
      } catch (error) {
        console.error(
          'Failed to fetch user profile:',
          error
        );
      }
    };

    fetchRegisteredHackathons();
    checkWalletConnection();
    fetchUserProfile();

    return () => clearTimeout(timer);
  }, []);

  // --------------------------------------------------
  // PROFILE PICTURE
  // --------------------------------------------------

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token =
          localStorage.getItem('token');

        if (!token) return;

        const res = await axios.get(
          '/api/auth/profile/picture',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          res.data &&
          res.data.profilePicture
        ) {
          const backendBaseUrl =
            import.meta.env.VITE_BACKEND_URL ||
            'https://nft-project-2y3b.onrender.com';

          let fullUrl =
            res.data.profilePicture.startsWith(
              'http'
            )
              ? res.data.profilePicture
              : backendBaseUrl +
                res.data.profilePicture;

          fullUrl += `?t=${Date.now()}`;

          setProfileImage(fullUrl);
        }
      } catch (err) {
        console.error(
          'Could not fetch profile picture:',
          err
        );
      }
    };

    fetchProfileImage();
  }, []);

  // --------------------------------------------------
  // COURSES
  // --------------------------------------------------

  useEffect(() => {
    const fetchAndMapCourses = async () => {
      try {
        const allCourses =
          await getCourses();

        const map = {};

        allCourses.forEach((course) => {
          map[course._id || course.id] =
            course.title;
        });

        setCoursesMap(map);
      } catch (err) {
        console.error(
          'Could not fetch courses:',
          err
        );

        setCoursesMap({});
      }
    };

    fetchAndMapCourses();
  }, [currentUser?.enrolledCourses]);

  // --------------------------------------------------
  // METAMASK ACCOUNT / NETWORK EVENTS
  // --------------------------------------------------

  useEffect(() => {
    if (
      typeof window.ethereum === 'undefined'
    ) {
      return;
    }

    const handleAccountsChanged = async (
      accounts
    ) => {
      if (!accounts || accounts.length === 0) {
        setWalletConnected(false);
        setWalletAddress('');
        setCertificates([]);
        return;
      }

      setWalletAddress(accounts[0]);
      setWalletConnected(true);

      try {
        const provider =
          new ethers.BrowserProvider(
            window.ethereum
          );

        const network =
          await provider.getNetwork();

        if (network.chainId === 11155111n) {
          await fetchUserNFTs(accounts[0]);
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error(
          'Failed to refresh wallet:',
          error
        );
      }
    };

    const handleChainChanged = async () => {
      try {
        const provider =
          new ethers.BrowserProvider(
            window.ethereum
          );

        const accounts =
          await provider.send(
            'eth_accounts',
            []
          );

        const network =
          await provider.getNetwork();

        if (
          accounts.length > 0 &&
          network.chainId === 11155111n
        ) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);

          await fetchUserNFTs(accounts[0]);
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error(
          'Chain changed error:',
          error
        );
      }
    };

    window.ethereum.on(
      'accountsChanged',
      handleAccountsChanged
    );

    window.ethereum.on(
      'chainChanged',
      handleChainChanged
    );

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );

        window.ethereum.removeListener(
          'chainChanged',
          handleChainChanged
        );
      }
    };
  }, []);

  // --------------------------------------------------
  // SHARE PROFILE
  // --------------------------------------------------

  const handleShare = () => {
    if (!currentUser?._id) return;

    const url = `${window.location.origin}/public-profile/${currentUser._id}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowTooltip(true);

        setTimeout(() => {
          setShowTooltip(false);
        }, 1200);
      })
      .catch((error) => {
        console.error(
          'Could not copy profile URL:',
          error
        );
      });
  };

  // --------------------------------------------------
  // ANIMATIONS
  // --------------------------------------------------

  const container = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: {
      y: 30,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Share Profile */}
        <div className="flex justify-end pt-8 mb-2 relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: '#14b8a6',
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition-all duration-300"
            onClick={handleShare}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 12h.01M12 12h.01M9 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
            </svg>

            Share Profile
          </motion.button>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: -40,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="absolute right-0 mt-2 px-3 py-1 bg-purple-600 text-white rounded shadow-lg text-sm"
              >
                Link copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Header */}
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
        >
          <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-t-xl shadow-lg p-8 text-white mb-2">
            <h1 className="text-3xl font-bold">
              Your Profile
            </h1>

            <p className="mt-2 text-purple-100">
              Manage your account, courses and
              certificates
            </p>
          </div>
        </motion.div>

        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
          <div className="md:flex">

            {/* =========================================
                PROFILE SIDEBAR
            ========================================= */}

            <motion.div
              className="md:w-1/3 bg-white p-8"
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
            >
              <div className="text-center">

                {/* Profile Image */}
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div
                    className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-4xl font-bold overflow-hidden border-4 border-white shadow-xl cursor-pointer group"
                    onClick={
                      handleProfileImageClick
                    }
                    title="Click to change profile picture"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      currentUser.name
                        ? currentUser.name
                            .charAt(0)
                            .toUpperCase()
                        : 'U'
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{
                        display: 'none',
                      }}
                      onChange={
                        handleProfileImageChange
                      }
                    />

                    <span className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow opacity-80 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4l6 6a2.828 2.828 0 01-4-4z" />
                      </svg>
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  {currentUser.name || 'User'}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {currentUser.email}
                </p>

                {/* Wallet */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  {walletConnected ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>

                      <span className="text-sm text-gray-600">
                        Wallet Connected
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="w-full text-sm bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      Connect Wallet to View
                      Certificates
                    </button>
                  )}

                  {walletConnected && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {walletAddress.substring(
                        0,
                        6
                      )}
                      ...
                      {walletAddress.substring(
                        walletAddress.length - 4
                      )}
                    </p>
                  )}
                </div>

                {/* Logout */}
                <div className="mt-6">
                  <button
                    onClick={logout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>

                    Logout
                  </button>
                </div>
              </div>
            </motion.div>

            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <motion.div
              className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.4,
                duration: 0.5,
              }}
            >

              {/* =====================================
                  ENROLLED COURSES
              ===================================== */}

              <motion.div
                className="p-8 border-b border-gray-200"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Enrolled Courses
                  </h2>
                </motion.div>

                {(() => {
                  const completedCoursesSet =
                    new Set(
                      currentUser.completedCourses?.map(
                        (id) => id.toString()
                      )
                    );

                  const filteredEnrolledCourses =
                    currentUser.enrolledCourses?.filter(
                      (id) =>
                        !completedCoursesSet.has(
                          id.toString()
                        )
                    ) || [];

                  if (
                    filteredEnrolledCourses.length >
                    0
                  ) {
                    return (
                      <div className="space-y-4">
                        {filteredEnrolledCourses.map(
                          (courseId) => (
                            <motion.div
                              key={courseId}
                              variants={item}
                              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                              <Link
                                to={`/courses/${courseId}`}
                                className="block p-4 flex items-center"
                              >
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 mr-4">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                    />
                                  </svg>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-800">
                                    {coursesMap[
                                      courseId
                                    ] ||
                                      `Course ID: ${courseId}`}
                                  </span>

                                  <div className="text-sm text-purple-600 mt-1">
                                    Continue Learning
                                  </div>
                                </div>

                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-400 ml-auto"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            </motion.div>
                          )
                        )}
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      variants={item}
                      className="bg-gray-50 rounded-lg p-6 text-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>

                      <p className="text-gray-600 mb-4">
                        You have not enrolled in any
                        courses yet.
                      </p>

                      <Link
                        to="/courses"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-300"
                      >
                        Browse Courses

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </motion.div>
                  );
                })()}
              </motion.div>

              {/* =====================================
                  COMPLETED COURSES
              ===================================== */}

              <motion.div
                className="p-8 border-b border-gray-200"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Completed Courses
                  </h2>
                </motion.div>

                {currentUser.completedCourses &&
                currentUser.completedCourses.length >
                  0 ? (
                  <div className="space-y-4">
                    {currentUser.completedCourses.map(
                      (courseId) => (
                        <motion.div
                          key={courseId}
                          variants={item}
                          className="bg-green-50 border border-green-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <Link
                            to={`/courses/${courseId}`}
                            className="block p-4 flex items-center"
                          >
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>

                            <div>
                              <span className="font-medium text-gray-800">
                                {coursesMap[
                                  courseId
                                ] ||
                                  `Course ID: ${courseId}`}
                              </span>

                              <div className="text-sm text-green-700 mt-1">
                                Completed
                              </div>
                            </div>

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400 ml-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </motion.div>
                      )
                    )}
                  </div>
                ) : (
                  <motion.div
                    variants={item}
                    className="bg-gray-50 rounded-lg p-6 text-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>

                    <p className="text-gray-600 mb-4">
                      You have not completed any
                      courses yet.
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* =====================================
                  PENDING CERTIFICATE REQUESTS
              ===================================== */}

              <motion.div
                className="p-8 border-b border-gray-200"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4"></div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Pending Certificate Requests
                  </h2>
                </motion.div>

                <PendingInvitations />
              </motion.div>

              {/* =====================================
                  REGISTERED HACKATHONS
              ===================================== */}

              <motion.div
                className="p-8 border-b border-gray-200"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4"></div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Registered Hackathons
                  </h2>
                </motion.div>

                {registeredHackathons &&
                registeredHackathons.length > 0 ? (
                  <div className="space-y-4">
                    {registeredHackathons.map(
                      (hackathon) => (
                        <motion.div
                          key={hackathon._id}
                          variants={item}
                          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <Link
                            to={`/hackathons/${hackathon._id}`}
                            className="block p-4 flex items-center"
                          >
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 mr-4"></div>

                            <div>
                              <span className="font-medium text-gray-800">
                                {hackathon.title}
                              </span>

                              <div className="flex items-center mt-1">
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  Already Registered
                                </span>

                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(
                                    hackathon.startDate
                                  ).toLocaleDateString()}{' '}
                                  -{' '}
                                  {new Date(
                                    hackathon.endDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400 ml-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </motion.div>
                      )
                    )}
                  </div>
                ) : (
                  <motion.div
                    variants={item}
                    className="bg-gray-50 rounded-lg p-6 text-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>

                    <p className="text-gray-600 mb-4">
                      You have not registered for any
                      hackathons yet.
                    </p>

                    <Link
                      to="/hackathons"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-300"
                    >
                      Browse Hackathons

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* =====================================
                  TEAM INVITATIONS
              ===================================== */}

              <motion.div
                className="p-8 border-b border-gray-200"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4"></div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Team Invitations
                  </h2>
                </motion.div>

                <TeamInvitations />
              </motion.div>

              {/* =====================================
                  INTERNSHIP INVITATIONS
              ===================================== */}

              <motion.div
                className="p-8 border-b border-gray-200"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4"></div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Pending Internship Invitations
                  </h2>
                </motion.div>

                <InternshipPendingInvitations />
              </motion.div>

              {/* =====================================
                  CERTIFICATES
              ===================================== */}

              <motion.div
                className="p-8"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={item}
                  className="flex items-center mb-6"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4"></div>

                  <h2 className="text-xl font-bold text-gray-800">
                    My Certificates
                  </h2>
                </motion.div>

                {walletConnected ? (
                  certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map(
                        (cert, index) => (
                          <motion.div
                            key={
                              cert.tokenId ||
                              index
                            }
                            variants={item}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                          >
                            <div className="relative">
                              <img
                                src={
                                  cert.metadata?.image
                                    ? cert.metadata.image.replace(
                                        'ipfs://',
                                        'https://ipfs.io/ipfs/'
                                      )
                                    : '/placeholder-certificate.png'
                                }
                                alt={
                                  cert.metadata?.name ||
                                  'Certificate'
                                }
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    '/placeholder-certificate.png';
                                }}
                              />

                              <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                                NFT
                              </div>
                            </div>

                            <div className="p-4">
                              <h3 className="font-bold text-gray-800 mb-1">
                                {cert.metadata
                                  ?.name ||
                                  'Certificate'}
                              </h3>

                              <p className="text-sm text-gray-600 mb-3">
                                {cert.metadata?.attributes?.find(
                                  (attr) =>
                                    attr.trait_type ===
                                    'Course'
                                )?.value ||
                                  'Course Completion'}
                              </p>

                              <div className="flex items-center text-xs text-gray-500 mb-4">
                                {cert.metadata?.attributes?.find(
                                  (attr) =>
                                    attr.trait_type ===
                                    'Date'
                                )?.value ||
                                  'Date not available'}
                              </div>

                              <div className="flex justify-between gap-2">
                                <a
                                  href={`https://sepolia.etherscan.io/token/${cert.contract_address}?a=${cert.tokenId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors duration-300"
                                >
                                  View on Blockchain
                                </a>

                                <button
                                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full transition-colors duration-300"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      `https://sepolia.etherscan.io/token/${cert.contract_address}?a=${cert.tokenId}`
                                    );
                                  }}
                                >
                                  Share
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <motion.div
                      variants={item}
                      className="bg-gray-50 rounded-lg p-6 text-center"
                    >
                      <p className="text-gray-600 mb-4">
                        You haven't earned any
                        certificates yet. Complete
                        courses to earn NFT
                        certificates.
                      </p>

                      <Link
                        to="/courses"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-300"
                      >
                        Continue Learning
                      </Link>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    variants={item}
                    className="bg-gray-50 rounded-lg p-6 text-center"
                  >
                    <p className="text-gray-600 mb-4">
                      Connect your wallet to view
                      your earned certificates.
                    </p>

                    <button
                      onClick={connectWallet}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-300"
                    >
                      Connect Wallet
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
