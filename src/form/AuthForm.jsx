import React, { useState } from "react";
import { useForm } from "react-hook-form";
import supabase from "../supabase/supabaseClient";
export default function AuthForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLogin, setisLogin] = useState(false);


  const onSubmit = async (data) => {
    let result;
    try {
      if (isLogin) {
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        console.log("User logged in:", result.data.user);
      } else {
        await supabase.auth.signOut({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              username: data.username,
            },
          },
        });
        console.log("user signed up", result.data.user);
      }
      if (result.errors) {
        throw result.errors;
      }
      console.log(isLogin? "SignIn":"SignUp",data)

    } catch (error) {
       console.error("Auth error:", error.message);
       alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFFFF] px-4 py-8">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
        <div className="flex-1 bg-[#FEFFFF] rounded-2xl p-6 sm:p-8 w-full max-w-md backdrop-blur-lg shadow-[5px_5px_10px_#babace,_-5px_-5px_10px_#ffffff]">
          <div className="flex flex-row items-center">
            <img
              src="https://www.pngall.com/wp-content/uploads/16/Google-Gemini-Logo-Transparent.png"
              alt="Logo"
              className="h-12 mb-3"
            />
            <h2 className="bg-gradient-to-r from-[#C94AFD] to-[#4F77FF] bg-clip-text text-transparent text-2xl mb-4 sm:text-[2rem] md:text-[2.1rem] leading-tight font-bold lg:text-[2.2rem] ml-2">
              Welcome to BotRix
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-lg px-4 py-3 bg-[#EDF0F3] text-gray-800 focus:outline-none"
                    {...register("name", { required: !isLogin })}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">
                      Name is required
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full rounded-lg px-4 py-3 bg-[#EDF0F3] text-gray-800 focus:outline-none"
                    {...register("username", { required: !isLogin })}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">
                      Username is required
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg px-4 py-3 bg-[#EDF0F3] text-gray-800 focus:outline-none"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">Email is required</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-lg px-4 py-3 bg-[#EDF0F3] text-gray-800 focus:outline-none"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  Password is required
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="flex items-center gap-2 text-white text-sm">
                <input type="checkbox" className="accent-[#4da6ff]" required />
                <p className="text-gray-500">
                  I agree to Terms of Conditions and{" "}
                  <span className="text-[#4da6ff]">Privacy of Policy</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#4da6ff] hover:bg-[#3385ff] text-white py-3 rounded-lg font-semibold mt-4"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-gray-500 gap-6 mt-4">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setisLogin(!isLogin)}
              className="text-[#4da6ff] hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
