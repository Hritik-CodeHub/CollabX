import { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";
import { Videocam, VideocamOff, Mic, MicOff, ScreenShare, StopScreenShare, Chat, MoreVert, KeyboardArrowDown, Settings, PhoneDisabled, MeetingRoom, CloseFullscreen, Person, VideoCameraFront } from '@mui/icons-material';
import api from "../axios/axios";
import { log } from "../utils/log";
import { AuthContext } from '../context/AuthContext';

const VideoMeet = () => {

    const { url } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    const connectionsRef = useRef({});
    const connections = connectionsRef.current;

    const [isValidating, setIsValidating] = useState(true);
    const [isValidMeeting, setIsValidMeeting] = useState(null);
    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState();
    const [screenAvailable, setScreenAvailable] = useState();
    const [message, setMessage] = useState([]);
    const [newMessage, setNewMessage] = useState();
    const [username, setUsername] = useState();
    const videoRef = useRef([]);
    const [videos, setVideos] = useState([]);
    const [askedForUserName, setAskedForUserName] = useState(true);
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(true);
            setAudioAvailable(true);
            window.localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (error) {
            log("Error accessing media devices:", error);
        }
    };

    const gotMessageFromServer = (fromId, message) => {
        let signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            }).catch((e) => console.log(e));
                        }).catch((e) => console.log(e));
                    }
                }).catch((e) => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
            }
        }
    }

    const addMessage = () => {

    }
    const server_url = "http://localhost:3000";
    const peerConfigConnections = {
        iceServers: [
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                ],
            },
        ],
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        console.log("socketRef.current", socketRef.current);

        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on("connect", () => {
            console.log("connected to socket server");
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);
            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                setSelectedParticipant((current) => current === id ? null : current);
            })
            socketRef.current.on("user-joined", (id, clients) => {

                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        const videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true,
                            }
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo]
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });

                        }
                    }

                    if (window.localStream) {
                        connections[socketListId].addStream(window.localStream);
                    } else {

                        let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSlience();
                        connections[socketListId].addStream(window.localStream);
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) {
                            continue;
                        }
                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (error) {

                        }
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                            }).catch((e) => console.log(e));
                        }).catch((e) => console.log(e));
                    }
                }
            })
        })
    }

    const silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    const black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                const tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {

            }
        }
    }

    const getUserSuccess = (stream) => {
        try {
            window.localStream?.getTracks().forEach(track => track.stop());

        } catch (error) {

        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                }).catch((e) => console.log(e));
            }).catch((e) => console.log(e));
        }

        stream.getTracks().forEach((track) => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }

            let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSlience();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    }).catch((e) => console.log(e));
                }).catch((e) => console.log(e));
            }
        })

    }

    useEffect(() => {
        let isMounted = true;

        const verifyMeeting = async () => {
            if (!url) {
                if (isMounted) {
                    setIsValidating(false);
                    setIsValidMeeting(false);
                }
                return;
            }

            try {
                setIsValidating(true);
                const res = await api.get(`/validate-meeting/${url.trim()}`);
                if (!isMounted) return;

                if (res.status === 200 && res.data?.isValid) {
                    setIsValidMeeting(true);
                    getPermissions();
                } else {
                    setIsValidMeeting(false);
                }
            } catch (err) {
                if (!isMounted) return;
                log("Meeting verification error:", err);
                setIsValidMeeting(false);
            } finally {
                if (isMounted) {
                    setIsValidating(false);
                }
            }
        };

        verifyMeeting();

        return () => {
            isMounted = false;
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [url]);

    const leaveCall = () => {
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        navigate('/home');
    };

    const getMedia = () => {
        connectToSocketServer();
    }

    const connect = () => {
        setAskedForUserName(false);
        getMedia();
    }

    const handleVideo = async () => {
        if (video) {
            // Turning camera OFF: physically stop hardware tracks so LED turns off
            setVideo(false);

            if (window.localStream) {
                // 1. Stop all video tracks so webcam sensor and LED release
                window.localStream.getVideoTracks().forEach(track => {
                    track.stop();
                    window.localStream.removeTrack(track);
                });

                // 2. Add dummy black track so WebRTC stream does not break
                const blackTrack = black();
                window.localStream.addTrack(blackTrack);

                // 3. Replace video track on all active peer connections
                for (let id in connections) {
                    const pc = connections[id];
                    const sender = pc?.getSenders?.().find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(blackTrack);
                    }
                }
            }
        } else {
            // Turning camera ON: request fresh camera stream
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = stream.getVideoTracks()[0];

                if (window.localStream) {
                    // Stop & remove any dummy black tracks
                    window.localStream.getVideoTracks().forEach(track => {
                        track.stop();
                        window.localStream.removeTrack(track);
                    });

                    // Add new live camera track
                    window.localStream.addTrack(newVideoTrack);

                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = window.localStream;
                    }

                    // Replace track on all active peer connections
                    for (let id in connections) {
                        const pc = connections[id];
                        const sender = pc?.getSenders?.().find(s => s.track && s.track.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(newVideoTrack);
                        }
                    }
                } else {
                    window.localStream = stream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                }

                setVideo(true);
            } catch (error) {
                console.error("Error turning on camera:", error);
            }
        }
    };

    const handleAudio = () => {
        const nextAudioState = !audio;
        setAudio(nextAudioState);

        if (window.localStream) {
            const audioTracks = window.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = nextAudioState;
            });
        }
    };

    const getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.log("Error stopping local stream tracks:", error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                }).catch((e) => console.log(e));
            });
        }

        stream.getTracks().forEach((track) => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }

            let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSlience();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })


    }

    const handleOpenChatModal = () => {
        setChatModalOpen(!chatModalOpen);
    }

    useEffect(() => {
        if (screen !== undefined) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((error) => {
                        console.log("Error accessing screen sharing:", error);
                    });
            }
        }
    }, [screen]);

    const handleScreen = () => {
        setScreen(!screen);
    }
    const sendMessage = () => {

    }

    const iconButtonClass = "grid size-10 place-items-center rounded-full bg-slate-100 text-slate-800 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

    if (isValidating) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbfa] font-sans text-secondary-foreground">
                <div className="size-10 animate-spin rounded-full border-4 border-[#d5f4ef] border-t-[#20c9bd]" />
                <p className="mt-4 text-base font-semibold text-secondary-foreground">Joining meeting...</p>
                <p className="mt-1 text-xs text-[#788196]">Verifying meeting code</p>
            </div>
        );
    }

    if (!isValidMeeting) {
        return (
            <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#f8fbfa] font-sans text-secondary-foreground">
                <div className="pointer-events-none absolute -left-32 top-20 h-100 w-100 rounded-full bg-[#d5f4ef]/70 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-0 h-112 w-md rounded-full bg-[#bdece7]/55 blur-3xl" />

                <header className="relative mx-auto flex h-20 w-full max-w-350 items-center justify-between px-5 sm:px-8 lg:px-12">
                    <Link to="/home" className="flex items-center gap-2.5 text-lg font-extrabold tracking-[-0.055em] text-secondary-foreground" aria-label="CollabX home">
                        <span className="grid size-9 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_18px_#20c7bb42]">
                            <VideoCameraFront className="text-[20px]!" />
                        </span>
                        <span>
                            Collab<span className="text-[#20c9bd]">X</span>
                        </span>
                    </Link>
                    {user?.name && (
                        <div className="flex items-center gap-3">
                            <span className="hidden text-xs font-semibold text-[#505a70] sm:inline">{user.name}</span>
                            <span className="grid size-8 place-items-center rounded-full bg-purple-500 text-xs font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </header>

                <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-6 grid size-20 place-items-center rounded-3xl bg-[#fee2e2] text-[#ef4444] shadow-sm">
                        <MeetingRoom className="text-[40px]!" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-secondary-foreground sm:text-3xl">
                        Invalid meeting code
                    </h1>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[#69738a] sm:text-base">
                        Check your meeting code. Make sure that you entered the correct code or link{url ? `: ` : '.'}
                        {url && <strong className="font-semibold text-[#102748]">{url}</strong>}
                    </p>
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-bold text-white shadow-[0_10px_22px_#20c7bb3e] transition hover:bg-[#17b8ae] focus:outline-none focus:ring-4 focus:ring-[#29c8bd]/25"
                        >
                            Return to home screen
                        </button>
                    </div>
                </main>

                <footer className="relative py-6 text-center text-xs text-[#8a92a3]">
                    CollabX Meetings &bull; Simple. Secure. Connected.
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-hidden bg-[#f8fbfa] font-sans text-secondary-foreground">

            {askedForUserName ? (

                <div className="min-h-screen border-t-4 border-[#4b3d4e]">
                    <div className="pointer-events-none absolute -left-32 top-20 h-100 w-100 rounded-full bg-[#d5f4ef]/70 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 bottom-0 h-112 w-md rounded-full bg-[#bdece7]/55 blur-3xl" />
                    <header className="flex h-16 items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-2 text-xl font-medium tracking-tight sm:text-2xl">
                            <Link to="/home" className="flex items-center gap-2.5 text-xl font-bold tracking-tight md:text-[23px]" aria-label="CollabX home">
                                <span>Collab<span className="text-[#20c9bd]">X</span></span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right text-xs sm:grid">
                                <span>{user?.name || 'You'}</span>
                                <span className="text-[11px]">Ready to collaborate</span>
                            </div>
                            <span className="grid size-8 place-items-center rounded-full bg-purple-500 text-sm text-white">{(user?.name || 'Y').charAt(0).toUpperCase()}</span>
                        </div>
                    </header>

                    <main className="mx-auto flex min-h-[calc(100vh-68px)] max-w-6xl flex-col items-center justify-center gap-10 px-5 py-10 md:flex-row md:items-center md:gap-16 lg:gap-28">
                        <section className="w-full max-w-154.5" aria-label="Camera preview">
                            <div className="relative h-[min(58vw,346px)] min-h-65 overflow-hidden rounded-xl bg-gradient-to-b from-[#17181a] via-[#202124] to-[#111214] text-slate-100">
                                <video
                                    className={`size-full object-cover transform-[scaleX(-1)] ${video ? '' : 'hidden'}`}
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                />
                                {!video && <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">Camera is off</p>}
                                <span className="absolute left-4 top-5 text-[13px] font-semibold">{user?.name || 'You'}</span>
                                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleAudio}
                                        className={iconButtonClass}
                                        aria-label={audio ? 'Turn off microphone' : 'Turn on microphone'}
                                    >
                                        {audio ? <Mic /> : <MicOff />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleVideo}
                                        className={`${iconButtonClass} ${video ? '' : 'bg-rose-100! text-rose-950! hover:bg-rose-200!'}`}
                                        aria-label={video ? 'Turn off camera' : 'Turn on camera'}
                                    >
                                        {video ? <Videocam /> : <VideocamOff />}
                                    </button>
                                    <button
                                        type="button"
                                        className="grid size-10 place-items-center rounded-full bg-[#63676b] text-slate-100 transition hover:bg-[#74787c] focus:outline-none focus:ring-2 focus:ring-white" aria-label="Visual effects"
                                    >
                                        <Settings />
                                    </button></div>
                            </div>
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Device settings">
                                {[[Mic, 'Microphone'], [Settings, 'Speaker'], [Videocam, 'Camera'], [Settings, 'Effects']].map(([Icon, label]) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className="flex h-8 min-w-max flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-xs text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <Icon className="text-base!" />
                                        <span>{label}</span>
                                        <KeyboardArrowDown className="!text-base" />
                                    </button>))}
                            </div>
                        </section>
                        <section className="w-full max-w-[220px] text-center">
                            <h1 className="mb-7 text-2xl font-normal tracking-tight">Ready to join?</h1>
                            <label className="mb-4 block text-left text-xs text-slate-600">
                                <span className="mb-1 block">Your name</span>
                                <input
                                    value={username || ''}
                                    placeholder="Enter your name"
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                            </label>
                            <button
                                type="button"
                                onClick={connect}
                                className="h-12 w-full rounded-full bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                                Ask to join
                            </button></section>
                    </main>
                </div>
            ) : (
                <div className="min-h-screen overflow-hidden bg-[#111315] p-4 pb-28 text-white sm:p-6 sm:pb-28">

                    {chatModalOpen &&
                        <aside className="fixed right-5 top-5 z-20 w-72 rounded-xl p-5 shadow-xl">
                            <h2 className="text-lg font-medium">Chat</h2>
                            <input type="text" />
                            <button>Send</button>
                        </aside>
                    }

                    <header className="flex items-center justify-between px-1 text-sm font-medium text-slate-100 sm:text-base">
                        <span>CollabX</span><span className="text-xs font-normal text-slate-400">{videos.length + 1} in call</span>
                    </header>

                    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-335 items-center justify-center py-5 sm:py-8">
                        {selectedParticipant ? (
                            <section className="relative flex h-[min(72vh,720px)] w-full items-center justify-center overflow-hidden rounded-3xl bg-[#26282c] shadow-2xl" aria-label="Focused participant">
                                {videos.filter((item) => item.socketId === selectedParticipant).map((remoteVideo) => (
                                    <video key={remoteVideo.socketId} className="size-full object-contain" autoPlay playsInline ref={(ref) => { if (ref) ref.srcObject = remoteVideo.stream; }} />
                                ))}
                                <span className="absolute bottom-5 left-5 rounded bg-black/45 px-3 py-1.5 text-sm font-medium">{selectedParticipant}</span>
                                <button type="button" onClick={() => setSelectedParticipant(null)} className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-xs font-medium text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"><CloseFullscreen className="!text-lg" />Exit full screen</button>
                            </section>
                        ) : videos.length ? (
                            <section className="grid w-full max-w-295 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Participants">
                                {videos.map((remoteVideo) => (
                                    <button
                                        key={remoteVideo.socketId}
                                        type="button"
                                        onClick={() => setSelectedParticipant(remoteVideo.socketId)}
                                        className="group relative aspect-video overflow-hidden rounded-2xl bg-[#292b2f] text-left shadow-lg outline-none ring-offset-[#111315] transition hover:-translate-y-0.5 hover:ring-2 hover:ring-blue-400 focus:ring-2 focus:ring-blue-400"
                                    >
                                        <video
                                            className="size-full object-cover"
                                            autoPlay
                                            playsInline
                                            ref={(ref) => {
                                                if (ref)
                                                    ref.srcObject = remoteVideo.stream;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                                        <span className="absolute bottom-3 left-3 rounded bg-black/45 px-2.5 py-1 text-xs font-medium text-white">{remoteVideo.socketId}</span>
                                        <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/40"><MicOff className="text-base!" /></span>
                                    </button>
                                ))}
                            </section>
                        ) : (
                            <div className="text-center text-slate-400"><Person className="mb-3 text-5xl!" /><p>Waiting for other participants to join</p></div>
                        )}
                    </main>

                    <section className="fixed bottom-24 right-4 z-10 w-40 overflow-hidden rounded-2xl bg-[#3c2a22] shadow-2xl ring-1 ring-white/10 sm:bottom-6 sm:right-6 sm:w-64" aria-label="Your video preview">
                        <div className="relative aspect-video">
                            <video className="size-full object-cover transform-[scaleX(-1)]" ref={localVideoRef} autoPlay muted playsInline />{!video && <div className="absolute inset-0 grid place-items-center bg-[#6e3a25]"><span className="grid size-12 place-items-center rounded-full bg-white/25 text-2xl">{(user?.name || 'Y').charAt(0).toUpperCase()}</span></div>}<span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-[#6a2109] text-white"><MicOff className="!text-sm" /></span></div>
                        <p className="truncate px-3 py-2 text-xs font-semibold uppercase text-white">{user?.name || 'You'} <span className="normal-case text-slate-300">(You)</span></p>
                    </section>

                    <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-[#202124] p-2 shadow-lg sm:bottom-6">
                        <button type="button" onClick={handleVideo} className="grid size-10 place-items-center rounded-full bg-[#4b4c50] text-white transition hover:bg-[#5f6166] focus:outline-none focus:ring-2 focus:ring-white" aria-label="Toggle camera">
                            {video ? <Videocam /> : <VideocamOff />}
                        </button>
                        <button type="button" onClick={handleAudio} className="grid size-10 place-items-center rounded-full bg-[#4b4c50] text-white transition hover:bg-[#5f6166] focus:outline-none focus:ring-2 focus:ring-white" aria-label="Toggle microphone">
                            {audio ? <Mic /> : <MicOff />}
                        </button>
                        <button type="button" onClick={leaveCall} className="grid size-10 place-items-center rounded-full bg-red-500 text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Leave call">
                            <PhoneDisabled />
                        </button>
                        {screenAvailable &&
                            <button type="button" onClick={handleScreen} className="grid size-10 place-items-center rounded-full bg-[#4b4c50] text-white transition hover:bg-[#5f6166] focus:outline-none focus:ring-2 focus:ring-white" aria-label="Toggle screen share">
                                {screen ? <ScreenShare /> : <StopScreenShare />}
                            </button>
                        }
                        <button type="button" onClick={handleOpenChatModal} className="relative grid size-10 place-items-center rounded-full bg-[#4b4c50] text-white transition hover:bg-[#5f6166] focus:outline-none focus:ring-2 focus:ring-white" aria-label="Open chat">
                            <Chat />{newMessage > 0 &&
                                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px]">{newMessage}
                                </span>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VideoMeet;
