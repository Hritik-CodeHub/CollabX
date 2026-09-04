import React from 'react'
import { VideoCameraFront } from '@mui/icons-material';

function Logo() {
    return (
        <div className="flex items-center gap-2.5 text-lg font-extrabold tracking-[-0.055em] text-secondary-foreground" aria-label="CollabX home">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_18px_#20c7bb42]">
                <VideoCameraFront className="text-2xl" />
            </span>
            <span className="text-2xl">
                Collab<span className="text-[#20c9bd]">X</span>
            </span>
        </div>
    )
}

export default Logo