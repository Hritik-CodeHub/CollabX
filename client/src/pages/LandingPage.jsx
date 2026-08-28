import { Link } from 'react-router-dom';
import { SVG } from '../constants/SVG';
import { ATTENDEES } from '../constants/landingPage.constant';

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_28%,#e8fbf8_0,#f8fbfa_33%,#fff_68%)] font-sans text-[#102748]">
      <nav className="mx-auto flex h-17.5 bg-gray-200  px-4 items-center justify-between" aria-label="Main navigation">
        <a className="flex items-center gap-2.5 text-xl font-bold tracking-tight md:text-[23px]" href="#top" aria-label="CollabX home"><span>Collab<span className="text-[#20c9bd]">X</span></span></a>
        <div className="flex items-center gap-8 text-sm font-semibold text-[#3c506a]">
          <a className="hidden hover:text-[#1bbdb4] sm:block" href="#about">About</a>
          <Link className="rounded-full bg-[#29c8bd] px-5 py-2.5 text-white shadow-[0_9px_20px_#20c7bb42] transition hover:-translate-y-0.5 hover:bg-[#17b8ae]" to="/home">Log in <span className="ml-1 ">→</span></Link>
        </div>
      </nav>

      <section className="px-6 pt-8.5 text-center md:pt-18.5" id="top">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#bce9e4] bg-[#effbf9] px-3 py-2 text-xs font-bold text-[#39706f]"><span className="h-1.5 w-1.5 rounded-full bg-[#22c8b8] shadow-[0_0_0_4px_#c6f0eb]" />Built for teams that move together</div>
        <h1 className="mx-auto mt-5 max-w-195 text-[43px] font-extrabold leading-[1.07] tracking-[-.065em] text-[#102849] md:text-[70px]">Meet face to face,<br /><span className="text-[#1fc6ba]">from anywhere.</span></h1>
        <p className="mx-auto mt-4 max-w-134 text-[15px] leading-relaxed text-[#5c6d80] md:text-[17px]">A beautifully simple workspace for the conversations, ideas, and decisions that bring your team closer.</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
          <Link to="/home" className="rounded-full bg-[#29c8bd] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_9px_20px_#20c7bb42] transition hover:-translate-y-0.5 hover:bg-[#17b8ae]">Get started for free <span className="ml-1">→</span></Link>
          <button className="py-2.5 text-sm font-bold text-[#2f4560]" type="button"><b className="mr-2 inline-grid h-5.5 w-5.5 place-items-center rounded-full bg-[#d7f4f1] text-[8px] text-[#19b8ad]">▶</b>See how it works</button>
        </div>
        <p className="mt-4 text-[10px] text-[#82909c] md:text-xs">No credit card required <span className="px-1.5 text-[#2ec9bd]">•</span> Free forever for small teams</p>
      </section>

      <section className="relative mx-auto mt-0 h-82.5 w-[calc(100%-28px)] max-w-250 md:mt-5 md:h-132.5 md:w-[calc(100%-60px)]" aria-label="CollabX video meeting preview">
        <div className="absolute left-0 top-16.25 h-57.5 w-full rounded-[50%] border border-[#cfefeb] md:left-20 md:top-30 md:h-87.5 md:w-167.5" /><div className="absolute left-[-10%] top-9.5 h-71.25 w-[120%] rounded-[50%] border border-[#e3f4f1] md:left-0 md:top-18 md:h-109.5 md:w-205" />
        <div className="absolute left-1/2 top-8.75 z-20 w-[calc(100%-8px)] -translate-x-1/2 rounded-t-[9px] border-[5px] border-[#173653] bg-[#173653] p-1.5 shadow-[0_28px_48px_#193c5230] md:w-190 md:rounded-t-[14px] md:border-8 md:p-2">
          <header className="flex h-6.75 items-center justify-between px-2 text-[8px] text-[#e7f6fa] md:h-8.75 md:text-[10px]"><div className="flex items-center gap-1 font-bold">CollabX</div><div className="font-semibold text-white"><span className="mr-1 inline-block h-1.25 w-1.25 rounded-full bg-[#fa6f72]" />Product brainstorm <small className="ml-2 text-[#91a5b8]">45:09</small></div><div className="grid h-5 w-5 place-items-center rounded-full bg-[#e9a892] text-[7px] font-bold text-[#173653]">SK</div></header>
          <div className="grid h-47.5 grid-cols-3 grid-rows-2 gap-0.75 bg-[#0a213c] md:h-83.75 md:gap-1.25">
            {ATTENDEES.map(([name, photo], index) => <article className="relative overflow-hidden bg-[#36546b]" key={name}><img className="h-full w-full object-cover object-[center_30%] saturate-[.78]" src={photo} alt="" /> <span className="absolute inset-0 bg-[linear-gradient(transparent_60%,#0a1c3099)]" />{index === 0 && <span className="absolute left-2 top-2 rounded-[3px] bg-[#1dc3b7] px-1.5 py-1 text-[7px] font-bold text-[#dffffb]">Speaking</span>}<span className="absolute bottom-2 left-2 text-[7px] font-semibold text-white drop-shadow md:bottom-2.5 md:left-2.5 md:text-[9px]">{name} <i className="ml-1 not-italic">⌁</i></span></article>)}
          </div>
          <footer className="flex h-9.5 items-center justify-center gap-1.5 md:h-12 md:gap-2"><button className="grid h-5.75 min-w-5.75 place-items-center rounded-md bg-[#2c4c68] px-2 text-white ">{SVG.MIC}</button><button className="grid h-5.75 min-w-5.75 place-items-center rounded-md bg-[#2c4c68] px-2 text-white fill-current">{SVG.CAMERA}</button><button className="grid h-5.75 place-items-center rounded-md bg-[#32bdb4] px-2 text-[8px] text-white md:h-6.75 md:text-[9px]">Share screen</button><button className="grid h-5.75 min-w-5.75 place-items-center rounded-md bg-[#e95e67] px-2 text-sm text-white md:h-6.75">⌕</button><button className="grid h-5.75 min-w-5.75 place-items-center rounded-md bg-[#2c4c68] px-2 text-[9px] tracking-widest text-white md:h-6.75">•••</button></footer>
        </div>
        <aside className="absolute right-4.5 top-30.75 z-30 hidden w-44 rounded-[11px] bg-white p-2.5 text-[9px] shadow-[0_16px_33px_#12324b2b] md:block"><div className="flex justify-between border-b border-[#edf0f2] px-0.5 pb-2.5 text-[10px] font-bold"><span>Team chat</span><b className="text-[#8d9ba8]">•••</b></div><div className="mt-2.5 flex gap-1.5"><span className="grid h-4.75 w-4.75 place-items-center rounded-full bg-[#e9a893] text-[8px] font-bold text-white">N</span><p className="m-0 leading-[1.35] text-[#69798a]"><b className="text-[#25405b]">Nadia</b><br />Love the direction!</p></div><div className="my-2.5 flex gap-1.5"><span className="grid h-4.75 w-4.75 place-items-center rounded-full bg-[#8175b4] text-[8px] font-bold text-white">S</span><p className="m-0 leading-[1.35] text-[#69798a]"><b className="text-[#25405b]">Sofia</b><br />I'll share the notes.</p></div><div className="border-t border-[#edf0f2] px-0.5 pt-2.5 text-[#9faab5]">Write a message <b className="float-right grid h-3.75 w-3.75 place-items-center rounded bg-[#27c5ba] text-[10px] text-white">↑</b></div></aside>
        <div className="absolute -left-4.5 top-19 z-40 flex scale-[.72] items-center gap-2 rounded-[9px] bg-white px-3 py-2.5 text-[10px] shadow-[0_13px_28px_#153a5630] md:left-4.5 md:top-24.25 md:scale-100"><span className="grid h-6.25 w-6.25 place-items-center rounded-[7px] bg-[#dcf8f5] text-[#1bc0b5]">✦</span><div><b className="block">AI meeting notes</b><small className="mt-0.5 block text-[8px] text-[#7e8c9a]">Summary is ready</small></div></div>
        <div className="absolute -right-3.25 bottom-11.75 z-40 scale-[.72] rounded-[9px] bg-white px-3 py-2 text-lg text-[#e56f82] shadow-[0_13px_28px_#153a5630] md:right-1.5 md:bottom-24.75 md:scale-100">♡ <span className="align-[2px] text-[10px] font-bold text-[#607387]">12</span></div>
      </section>
      <section className="mb-11 mt-0 text-center text-[10px] font-bold tracking-[.16em] text-[#90a0aa] md:mb-11.25 md:mt-1"><span>TRUSTED BY TEAMS AT</span><div className="mt-5 flex items-center justify-center gap-3 text-[15px] tracking-tight text-[#9ca7ae] sm:gap-13 md:text-[21px]"><b>loom</b><b>monday</b><b>Webflow</b><b>tally</b><b>Pitch</b></div></section>
    </main>
  );
}

export default LandingPage;
