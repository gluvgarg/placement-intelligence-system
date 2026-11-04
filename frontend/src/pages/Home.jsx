
import { motion } from "motion/react";
import { Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext.jsx";
import coverImage from "../assets/home_bg.png";

const ease = [0.22, 1, 0.36, 1];

// Decorative network pulse positions
const networkNodes = [
  { top: "23%", right: "20%", delay: 0 },
  { top: "39%", right: "31%", delay: 1.2 },
  { top: "56%", right: "12%", delay: 2.1 },
  { top: "72%", right: "27%", delay: 0.8 },
  { top: "84%", right: "9%", delay: 2.8 },
];

const Home = () => {
  const { user, role, loading, isAuthenticated } = useAuth();

  const firstName =
    user?.fullname?.trim().split(/\s+/)[0] || "there";

  return (
    <> 
      <section
        id="home"
        className="relative min-h-screen w-full overflow-hidden bg-[#111820]"
      >

        {/* Continuously Moving Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${coverImage})`,
          }}
          animate={{
            scale: [1.04, 1.08, 1.04],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Background Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1118]/95 via-[#111820]/80 to-[#111820]/15" />

        <div className="absolute inset-0 bg-[#0B1118]/10" />

        {/* Ambient Light - Right Side */}
        <motion.div
          className="pointer-events-none absolute -right-24 top-[15%]
          h-[450px] w-[450px] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(91,146,149,0.22), transparent 70%)",
          }}
          animate={{
            opacity: [0.35, 0.7, 0.35],
            scale: [0.9, 1.12, 0.9],
            x: [0, -25, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Second Ambient Light */}
        <motion.div
          className="pointer-events-none absolute bottom-[-100px]
          right-[18%] h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(135,167,184,0.17), transparent 70%)",
          }}
          animate={{
            opacity: [0.2, 0.55, 0.2],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Network Light Pulses */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">

          {networkNodes.map((node, index) => (
            <motion.div
              key={index}
              className="absolute h-2 w-2 rounded-full bg-[#A5C2CE]"
              style={{
                top: node.top,
                right: node.right,
              }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
                scale: [0.7, 1.5, 0.7],
                boxShadow: [
                  "0 0 3px rgba(165,194,206,0.2)",
                  "0 0 14px rgba(165,194,206,0.85)",
                  "0 0 3px rgba(165,194,206,0.2)",
                ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.delay,
              }}
            />
          ))}

        </div>

        {/* Main Content */}
        <div className="relative z-10 flex min-h-screen items-center
        px-6 pt-28 pb-20 md:px-16 lg:px-24">

          <div className="max-w-3xl">

            {/* Personalized Greeting */}
            {!loading && isAuthenticated && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-5 text-sm font-semibold
                tracking-widest text-[#91AFC0]"
              >
                WELCOME BACK, {firstName.toUpperCase()}
              </motion.p>
            )}

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-[1.12]
            tracking-tight text-[#F0F3F5]
            sm:text-6xl lg:text-7xl">

              <span className="block">

                <motion.span
                  initial={{
                    opacity: 0,
                    y: 55,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.15,
                    ease,
                  }}
                  className="inline-block mr-3"
                >
                  Transform
                </motion.span>

                <motion.span
                  initial={{
                    opacity: 0,
                    y: 55,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.32,
                    ease,
                  }}
                  className="inline-block"
                >
                  Your
                </motion.span>

              </span>

              <span className="mt-2 block text-[#91AFC0]">

                <motion.span
                  initial={{
                    opacity: 0,
                    y: 65,
                    rotateX: -25,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.52,
                    ease,
                  }}
                  className="inline-block mr-3"
                >
                  Placement
                </motion.span>

                <motion.span
                  initial={{
                    opacity: 0,
                    y: 65,
                    rotateX: -25,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.72,
                    ease,
                  }}
                  className="inline-block"
                >
                  Journey.
                </motion.span>

              </span>
            </h1>

            {/* Animated Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 0.9,
                delay: 1.25,
                ease,
              }}
              style={{ transformOrigin: "left" }}
              className="my-7 h-[3px] w-[68px]
              rounded-full bg-[#5B9295]"
            />

            {/* Description */}
            <motion.p
              initial={{
                opacity: 0,
                x: -35,
                filter: "blur(5px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.9,
                delay: 1.35,
                ease,
              }}
              className="max-w-xl text-base leading-8
              text-[#B8C2CB] sm:text-lg"
            >
              {!loading && isAuthenticated
                ? `Welcome back, ${firstName}! Continue developing your skills, exploring career opportunities, and preparing for your next placement milestone.`
                : `Welcome to the Placement Intelligence Platform. Prepare smarter, practice better, and stay ahead with career insights, placement resources, and tools designed to help you land your dream job.`}
            </motion.p>

            {/* Authentication-Based Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">

              {loading ? (
                <div className="h-12 w-40 animate-pulse rounded-lg bg-white/10" />
              ) : isAuthenticated ? (

                <motion.div
                  initial={{ opacity: 0, y: 35, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 1.65,
                    ease,
                  }}
                  whileHover={{ y: -5, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Link
                    to={`/${role}/dashboard`}
                    className="group flex items-center gap-3
                    rounded-lg bg-[#5B9295] px-8 py-3.5
                    font-semibold text-[#101820]
                    shadow-lg shadow-black/20
                    hover:bg-[#70A5A5]"
                  >
                    Go to Dashboard

                    <span className="transition-transform
                    group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </motion.div>

              ) : (

                <>
                  <motion.div
                    initial={{ opacity: 0, y: 35, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.65,
                      ease,
                    }}
                    whileHover={{
                      y: -5,
                      scale: 1.04,
                      backgroundColor: "#70A5A5",
                      boxShadow: "0px 12px 28px rgba(91,146,149,0.3)",
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Link
                      to="/register"
                      className="group flex items-center gap-3
                      rounded-lg bg-[#5B9295] px-8 py-3.5
                      font-semibold text-[#101820]
                      shadow-lg shadow-black/20"
                    >
                      Get Started

                      <span className="transition-transform
                      group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 35, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.85,
                      ease,
                    }}
                    whileHover={{
                      y: -5,
                      scale: 1.03,
                      borderColor: "#87AFC0",
                      backgroundColor: "rgba(135,167,184,0.14)",
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Link
                      to="/login"
                      className="block rounded-lg border
                      border-[#647785] bg-[#17232C]/50
                      px-8 py-3.5 font-semibold text-[#E1E7EB]
                      backdrop-blur-sm"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                </>
              )}

            </div>

            {/* Supporting Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 2.1,
                ease,
              }}
              className="mt-12 flex flex-wrap items-center
              gap-x-5 gap-y-2 text-xs font-medium
              tracking-wider text-[#8796A2]"
            >
              <span>SKILL DEVELOPMENT</span>
              <span className="text-[#5B9295]">/</span>
              <span>PLACEMENT PREPARATION</span>
              <span className="text-[#5B9295]">/</span>
              <span>CAREER GROWTH</span>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
