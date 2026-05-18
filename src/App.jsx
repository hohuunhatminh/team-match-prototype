import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserRound,
  Users,
  Send,
  CheckCircle2,
  XCircle,
  Clock3,
  LogIn,
  FileText,
  SlidersHorizontal,
  PlusCircle,
} from "lucide-react";
import "./App.css";

const initialPosts = [
  {
    id: 1,
    course: "Software Engineering",
    title: "Looking for Frontend Developer",
    role: "Frontend Developer",
    skills: ["React", "Next.js", "UI"],
    time: "Mon/Wed Evening",
    recruitCount: 1,
    author: "Kim Minwoo",
    description:
      "We are building a student team matching platform. We need one member who can implement main UI screens and connect frontend flow.",
  },
  {
    id: 2,
    course: "Computer Network",
    title: "Need Backend/API Member",
    role: "Backend Developer",
    skills: ["Node.js", "REST API", "Database"],
    time: "Weekend",
    recruitCount: 1,
    author: "Lee Hana",
    description:
      "Our team needs a backend member who can design APIs and handle data flow for a network assignment dashboard.",
  },
  {
    id: 3,
    course: "Capstone Design",
    title: "Recruiting UI/UX Designer",
    role: "UI/UX Designer",
    skills: ["Figma", "Wireframe", "UX"],
    time: "Tue/Thu Afternoon",
    recruitCount: 2,
    author: "Park Jisoo",
    description:
      "We need a designer to create wireframes, user flow, and presentation-ready screens for our capstone service.",
  },
];

const initialProfile = {
  name: "Ho Huu Nhat Minh",
  major: "Computer Science",
  skills: "React, Next.js, C++, UI Design",
  role: "Frontend Developer",
  time: "Mon/Wed Evening",
  introduction:
    "I want to join a team where I can contribute to frontend implementation and UI flow design.",
};

const emptyPostForm = {
  course: "Software Engineering",
  title: "Looking for Project Member",
  role: "Frontend Developer",
  skills: "React, UI, Communication",
  time: "Mon/Wed Evening",
  recruitCount: 1,
  description:
    "We are looking for a teammate who can join our course project and contribute to the main implementation flow.",
};

function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

function Button({ children, variant = "primary", onClick, className = "" }) {
  return (
    <button className={`btn ${variant === "outline" ? "btn-outline" : "btn-primary"} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function StepButton({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`step-button ${active ? "active" : ""}`}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function Header({ title, subtitle }) {
  return (
    <div className="header-block">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {title}
      </motion.h1>
      <p>{subtitle}</p>
    </div>
  );
}

function Card({ children }) {
  return <div className="card">{children}</div>;
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [profileSavedAt, setProfileSavedAt] = useState("Not saved yet");
  const [posts, setPosts] = useState(initialPosts);
  const [postForm, setPostForm] = useState(emptyPostForm);
  const [selectedPost, setSelectedPost] = useState(initialPosts[0]);
  const [filter, setFilter] = useState("All");
  const [requestStatus, setRequestStatus] = useState("Not Sent");
  const [toast, setToast] = useState("");

  const filterOptions = useMemo(() => {
    const courses = posts.map((post) => post.course);
    const skills = posts.flatMap((post) => post.skills);
    const times = posts.map((post) => post.time);
    return ["All", ...new Set([...courses, ...skills, ...times])];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (filter === "All") return posts;
    return posts.filter(
      (post) => post.course === filter || post.skills.includes(filter) || post.time === filter
    );
  }, [filter, posts]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  };

  const handleSaveProfile = () => {
    if (!profile.name.trim() || !profile.major.trim() || !profile.skills.trim()) {
      showToast("Please fill in name, major, and skills");
      return;
    }

    const normalizedProfile = {
      ...profile,
      name: profile.name.trim(),
      major: profile.major.trim(),
      skills: profile.skills.trim(),
      role: profile.role.trim() || "Team Member",
      time: profile.time.trim() || "Flexible",
      introduction: profile.introduction.trim(),
    };

    setProfile(normalizedProfile);
    setSavedProfile(normalizedProfile);
    setProfileSavedAt(new Date().toLocaleString());
    showToast("Profile saved");
  };

  const handleCreatePost = () => {
    const parsedSkills = postForm.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!postForm.title.trim() || !postForm.course.trim() || parsedSkills.length === 0) {
      showToast("Please fill in required post information");
      return;
    }

    const newPost = {
      id: Date.now(),
      course: postForm.course.trim(),
      title: postForm.title.trim(),
      role: postForm.role.trim() || "Team Member",
      skills: parsedSkills,
      time: postForm.time.trim() || "Flexible",
      recruitCount: Number(postForm.recruitCount) || 1,
      author: savedProfile.name,
      description: postForm.description.trim(),
    };

    setPosts([newPost, ...posts]);
    setSelectedPost(newPost);
    setFilter("All");
    setRequestStatus("Not Sent");
    setScreen("detail");
    showToast("Team post created");
  };

  const screens = [
    { id: "login", label: "Login", icon: LogIn },
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "create", label: "Create Post", icon: PlusCircle },
    { id: "posts", label: "Team Posts", icon: Users },
    { id: "detail", label: "Post Detail", icon: FileText },
    { id: "requests", label: "Request Management", icon: CheckCircle2 },
  ];

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">
              <Users size={22} />
            </div>
            <h2>TeamMatch Prototype</h2>
            <p>Demo for system design validation using mock data.</p>
          </div>

          <nav className="nav-list">
            {screens.map((item) => (
              <StepButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={screen === item.id}
                onClick={() => setScreen(item.id)}
              />
            ))}
          </nav>

          <div className="scope-box">
            <p className="scope-title">Demo Scope</p>
            <p>Login → Profile → Create Post → Search Posts → Send Join Request → Accept/Reject</p>
          </div>
        </aside>

        <main className="main-panel">
          {toast && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="toast">
              {toast}
            </motion.div>
          )}

          {screen === "login" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header
                title="Login"
                subtitle="This screen represents the starting point of the team project matching platform."
              />
              <div className="two-column">
                <Card>
                  <label>Email</label>
                  <input defaultValue="minh@student.edu" />

                  <label>Password</label>
                  <input type="password" defaultValue="12345678" />

                  <Button
                    className="full-width"
                    onClick={() => {
                      setScreen("profile");
                      showToast("Login successful");
                    }}
                  >
                    <LogIn size={18} /> Login
                  </Button>
                </Card>

                <div className="dark-info-box">
                  <h3>Prototype Purpose</h3>
                  <p>
                    This prototype does not implement the full system. It validates the core flow defined in the
                    system design: profile creation, team post creation, post browsing, join request sending, and request handling.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header
                title="Student Profile"
                subtitle="Students enter structured information so other users can judge team fit more clearly."
              />

              <Card>
                <div className="form-grid">
                  {[
                    ["Name", "name"],
                    ["Major", "major"],
                    ["Skills", "skills"],
                    ["Preferred Role", "role"],
                    ["Available Time", "time"],
                  ].map(([label, key]) => (
                    <div key={key} className="field">
                      <label>{label}</label>
                      <input
                        value={profile[key]}
                        onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                      />
                    </div>
                  ))}

                  <div className="field full-grid">
                    <label>Introduction</label>
                    <textarea
                      value={profile.introduction}
                      onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
                    />
                  </div>
                </div>

                <div className="button-row">
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                  <Button variant="outline" onClick={() => setScreen("create")}>Create Team Post</Button>
                  <Button variant="outline" onClick={() => setScreen("posts")}>Go to Team Posts</Button>
                </div>

                <div className="status-box">
                  <p>Saved Profile</p>
                  <span>
                    <CheckCircle2 size={17} /> {savedProfile.name} · {savedProfile.major} · {savedProfile.role}
                  </span>
                  <p style={{ marginTop: 10 }}>Skills: {savedProfile.skills}</p>
                  <p>Available Time: {savedProfile.time}</p>
                  <p>Last Saved: {profileSavedAt}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {screen === "create" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header
                title="Create Team Post"
                subtitle="Post authors enter structured recruitment conditions so applicants can compare teams clearly."
              />

              <Card>
                <div className="form-grid">
                  {[
                    ["Course", "course"],
                    ["Post Title", "title"],
                    ["Required Role", "role"],
                    ["Required Skills", "skills"],
                    ["Available Time", "time"],
                    ["Recruit Count", "recruitCount"],
                  ].map(([label, key]) => (
                    <div key={key} className="field">
                      <label>{label}</label>
                      <input
                        type={key === "recruitCount" ? "number" : "text"}
                        min={key === "recruitCount" ? "1" : undefined}
                        value={postForm[key]}
                        onChange={(e) => setPostForm({ ...postForm, [key]: e.target.value })}
                      />
                    </div>
                  ))}

                  <div className="field full-grid">
                    <label>Description</label>
                    <textarea
                      value={postForm.description}
                      onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="button-row">
                  <Button onClick={handleCreatePost}>
                    <PlusCircle size={18} /> Create Post
                  </Button>
                  <Button variant="outline" onClick={() => setScreen("posts")}>Back to Team Posts</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {screen === "posts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header
                title="Team Post List"
                subtitle="Students can browse structured team recruitment posts and filter them by course, skill, or available time."
              />

              <div className="button-row" style={{ marginBottom: 20 }}>
                <Button onClick={() => setScreen("create")}>
                  <PlusCircle size={18} /> Create New Post
                </Button>
              </div>

              <div className="filter-row">
                <SlidersHorizontal size={18} />
                {filterOptions.map((item) => (
                  <button key={item} onClick={() => setFilter(item)} className={`filter-chip ${filter === item ? "active" : ""}`}>
                    {item}
                  </button>
                ))}
              </div>

              <div className="post-list">
                {filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <div className="post-card-content">
                      <div>
                        <p className="eyebrow">{post.course}</p>
                        <h3>{post.title}</h3>
                        <div className="pill-row">
                          <Pill>{post.role}</Pill>
                          <Pill>{post.time}</Pill>
                          {post.skills.map((skill) => (
                            <Pill key={skill}>{skill}</Pill>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedPost(post);
                          setRequestStatus("Not Sent");
                          setScreen("detail");
                        }}
                      >
                        <Search size={17} /> View Detail
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {screen === "detail" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header
                title="Post Detail"
                subtitle="This page shows detailed recruitment conditions before the student sends a join request."
              />

              <Card>
                <p className="eyebrow">{selectedPost.course}</p>
                <h2 className="detail-title">{selectedPost.title}</h2>
                <p className="description">{selectedPost.description}</p>

                <div className="info-grid">
                  <div>
                    <p>Required Role</p>
                    <strong>{selectedPost.role}</strong>
                  </div>
                  <div>
                    <p>Available Time</p>
                    <strong>{selectedPost.time}</strong>
                  </div>
                  <div>
                    <p>Recruit Count</p>
                    <strong>{selectedPost.recruitCount}</strong>
                  </div>
                </div>

                <div className="pill-row spaced">
                  {selectedPost.skills.map((skill) => (
                    <Pill key={skill}>{skill}</Pill>
                  ))}
                </div>

                <div className="button-row">
                  <Button
                    onClick={() => {
                      setRequestStatus("Pending");
                      showToast("Join request sent");
                    }}
                  >
                    <Send size={18} /> Send Join Request
                  </Button>
                  <Button variant="outline" onClick={() => setScreen("posts")}>Back to Team Posts</Button>
                  <Button variant="outline" onClick={() => setScreen("requests")}>Open Request Management</Button>
                </div>

                <div className="status-box">
                  <p>Request Status</p>
                  <span>
                    <Clock3 size={17} /> {requestStatus}
                  </span>
                </div>
              </Card>
            </motion.div>
          )}

          {screen === "requests" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header
                title="Request Management"
                subtitle="The post author checks incoming join requests and accepts or rejects them."
              />

              <Card>
                <div className="request-layout">
                  <div>
                    <p className="eyebrow">Incoming Request</p>
                    <h2>Request from {savedProfile.name}</h2>
                    <p className="description">{savedProfile.introduction}</p>

                    <div className="pill-row spaced">
                      <Pill>{savedProfile.major}</Pill>
                      <Pill>{savedProfile.role}</Pill>
                      <Pill>{savedProfile.time}</Pill>
                      {savedProfile.skills
                        .split(",")
                        .slice(0, 4)
                        .map((skill) => (
                          <Pill key={skill.trim()}>{skill.trim()}</Pill>
                        ))}
                    </div>
                  </div>

                  <div className="current-status">
                    <p>Current Status</p>
                    <strong>{requestStatus}</strong>
                  </div>
                </div>

                <div className="button-row">
                  <Button
                    onClick={() => {
                      setRequestStatus("Accepted");
                      showToast("Request accepted");
                    }}
                  >
                    <CheckCircle2 size={18} /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRequestStatus("Rejected");
                      showToast("Request rejected");
                    }}
                  >
                    <XCircle size={18} /> Reject
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
