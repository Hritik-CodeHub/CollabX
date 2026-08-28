import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { RiVideoOnLine, RiVideoOffLine, RiMicLine, RiMicOffLine, RiPhoneLine, RiAirplayLine, RiStopCircleLine, RiChatUnreadLine } from "@remixicon/react";
import { Videocam, VideocamOff, Mic, MicOff, ScreenShare, StopScreenShare, Chat } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';

const VideoMeet = () => {

    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    let connections = [];

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState([]);
    const [audio, setAudio] = useState();
    const [screen, setScreen] = useState();
    const [screenAvailable, setScreenAvailable] = useState();
    const [message, setMessage] = useState();
    const [newMessage, setNewMessage] = useState();
    const [username, setUsername] = useState();
    const videoRef = useRef([]);
    const [videos, setVideos] = useState([]);
    const [askedForUserName, setAskedForUserName] = useState(true);
    const [chatModalOpen, setChatModalOpen] = useState(false);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });

            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable || screenAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable,
                });

                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                        console.log("local video ref", userMediaStream);
                    }
                }
            }
        } catch (error) {

        }
    }

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
        socketRef.current = io.connect('http://localhost:3000', { secure: false });
        console.log("socketRef.current", socketRef.current);
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {
            console.log("connected to socket server");
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);
            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
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
            window.localStorage.getTracks().forEach(track => track.stop())

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
                connections[id].addStream(window.localStorage)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    }).catch((e) => console.log(e));
                }).catch((e) => console.log(e));
            }
        })

    }

    useEffect(() => {
        getPermissions();
    }, [videoAvailable, audioAvailable, screenAvailable]);

    useEffect(() => {
        if (video != undefined && audio != undefined) {
            getUserMedia();
        }
    }, [video, audio]);

    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const connect = () => {
        setAskedForUserName(false);
        getMedia();
    }

    const handleVideo = () => {
        setVideo(!video);
    }

    const handleAudio = () => {
        setAudio(!audio);
    }

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

    return (
        <div>
            {askedForUserName === true ?
                <div>
                    <input type="text" placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} />
                    <button type="submit" onClick={connect}>Connect</button>
                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>
                </div> :
                <div>

                    {chatModalOpen && <div>
                        <h1>Chat</h1>
                    </div>
                    }

                    <div>
                        <IconButton onClick={handleVideo}>
                            {video == true ? <Videocam /> : <VideocamOff />}
                        </IconButton>
                        <IconButton onClick={handleAudio}>
                            {audio == true ? <Mic /> : <MicOff />}
                        </IconButton>
                        <IconButton >
                            <RiPhoneLine />
                        </IconButton>

                        {screenAvailable == true &&
                            <IconButton onClick={handleScreen}>
                                {screen == true ? <ScreenShare /> : <StopScreenShare />}
                            </IconButton>}

                        <IconButton onClick={handleOpenChatModal}>
                            <Badge
                                badgeContent={newMessage}
                                color="primary"
                                max={99}
                            >
                                <Chat />
                            </Badge>
                        </IconButton>
                    </div>
                    <video ref={localVideoRef} autoPlay muted></video>
                    {videos.map((video) => (
                        <div key={video.socketId}>
                            <h2>{video.socketId}</h2>
                            <video autoPlay playsInline muted ref={(ref) => {
                                if (ref) {
                                    ref.srcObject = video.stream;
                                }
                            }} />
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}

export default VideoMeet;
