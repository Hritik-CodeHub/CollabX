import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import CustomInputField from '../components/common/CustomInputField';
import api from '../axios/axios';
import toast from "react-hot-toast";
import { log } from "../utils/log";
import { AuthContext } from '../context/AuthContext';

import { useForm } from 'react-hook-form';

function Authentication() {
  const { setUserData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('login');
  const { control, handleSubmit, reset } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  const toggleLogin = (tab) => {
    reset({
      name: '',
      email: '',
      password: '',
    });
    setActiveTab(tab);
  };

  const submitForm = async (data) => {
    if (activeTab === 'login') {
      try {
        const res = await api.post('/login', {
          email: data.email,
          password: data.password,
        }
        )
        if (res.status == 200) {
          toast.success(res?.data?.message);
          setUserData(res?.data?.userData, res?.data?.token);
        }
      } catch (error) {
        log("Login error", data, error);
        toast.error("Something went wrong");
      }

    } else {
      try {
        const res = await api.post('/register',
          {
            name: data.name,
            email: data.email,
            password: data.password,
          },
        )
        if (res.status == 200) {
          toast.success(res?.data?.message);
          setUserData(res?.data?.userData, res?.data?.token);
        }
      } catch (error) {
        log("Register error", data, error);
        toast.error("Something wents wrong");
      }
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_15%,var(--color-primary-soft)_0,#f8fbfa_35%,#fff_70%)] px-5 py-10 font-sans text-secondary-foreground">
      <div className="absolute -left-32 top-24 h-80 w-80 rounded-full border border-[#caeeea]" />
      <div className="absolute -right-28 -bottom-22.5 h-96 w-96 rounded-full border border-[#d8f2ef]" />

      <section className="relative w-full max-w-110" aria-labelledby="authentication-title">
        <Link className="mx-auto mb-8 flex w-fit items-center text-2xl font-extrabold tracking-tight" to="/" aria-label="CollabX home">
          Collab<span className="text-primary">X</span>
        </Link>

        <div className="rounded-[26px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_#1736531a] backdrop-blur sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-extrabold tracking-[-0.04em]" id="authentication-title">{activeTab === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="mt-2 text-sm leading-relaxed text-secondary-muted">{activeTab === 'login' ? 'Log in to continue collaborating with your team.' : 'Start bringing your team closer today.'}</p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-xl bg-primary-subtle p-1" role="tablist" aria-label="Authentication options">
            {['login', 'register'].map((tab) => (
              <button
                className={`rounded-lg px-3 py-2.5 text-sm font-bold capitalize transition ${activeTab === tab ? 'bg-white text-secondary shadow-[0_3px_10px_#17365312]' : 'text-[#738493] hover:text-secondary-hover'}`}
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => toggleLogin(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
            {activeTab !== 'login' && (
              <CustomInputField
                name="name"
                label="Full name"
                placeholder="Enter your full name"
                control={control}
                rules={{ required: 'Full name is required' }}
              />
            )}
            <CustomInputField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              control={control}
              rules={{ required: 'email is required' }}
            />
            <CustomInputField
              name="password"
              label="Password"
              type="password" autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              placeholder="Enter your password"
              control={control}
              rules={{ required: 'Password is required' }}
            />
            {activeTab === 'login' && <div className="-mt-1 text-right"><button className="text-xs font-bold text-primary-link hover:text-primary-hover" type="button">Forgot password?</button></div>}
            <button className="mt-2 h-12 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-[0_10px_22px_#20c7bb42] transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/25" type="submit">
              {activeTab === 'login' ? 'Log in to CollabX' : 'Create account'} <span className="ml-1">→</span>
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#748494]">
            {activeTab === 'login' ? 'New to CollabX?' : 'Already have an account?'}{' '}
            <button className="font-bold text-primary-link hover:text-primary-hover" type="button" onClick={() => toggleLogin(activeTab === 'login' ? 'register' : 'login')}>
              {activeTab === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Authentication;
