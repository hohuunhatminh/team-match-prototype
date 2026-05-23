import React, { useEffect, useMemo, useState } from "react";
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
  ListChecks,
  Pencil,
  Trash2,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient";
import "./App.css";

const DEMO_USER_ID = "demo-user";

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

function mapPost(row) {
  return {
    id: row.id,
    course: row.course,
    title: row.title,
    role: row.role,
    skills: row.skills || [],
    time: row.available_time,
    recruitCount: row.recruit_count,
    author: row.author_name,
    description: row.description || "",
  };
}

function mapRequest(row) {
  return {
    id: row.id,
    postId: row.post_id,
    postTitle: row.team_posts?.title || "Deleted post",
    course: row.team_posts?.course || "Unknown course",
    role: row.team_posts?.role || "Team Member",
    receiver: row.team_posts?.author_name || "Post author",
    applicant: row.applicant_name,
    status: row.status,
    sentAt: row.created_at ? new Date(row.created_at).toLocaleString() : "Unknown time",
  };
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [profileSavedAt, setProfileSavedAt] = useState("Not saved yet");
  const [posts, setPosts] = useState(initialPosts);
  const [postForm, setPostForm] = useState(emptyPostForm);
  const [editingPostId, setEditingPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(initialPosts[0]);
  const [filter, setFilter] = useState("All");
  const [requestStatus, setRequestStatus] = useState("Not Sent");
  const [sentRequests, setSentRequests] = useState([]);
  const [toast, setToast] = useState("");
  const [backendStatus, setBackendStatus] = useState(
    isSupabaseConfigured ? "Supabase connected" : "Mock mode: Supabase env missing"
  );

  const isEditingPost = editingPostId !== null;

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

  const selectedRequest = sentRequests.find((request) => request.postId === selectedPost.id);
  const currentRequestStatus = selectedRequest?.status || requestStatus;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const runSupabase = async (action, fallbackMessage) => {
    if (!isSupabaseConfigured || !supabase) {
      showToast(fallbackMessage || "Supabase is not configured yet");
      return null;
    }

    try {
      return await action();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Supabase request failed");
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const data = await runSupabase(async () => {
        const [profileResult, postsResult, requestsResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", DEMO_USER_ID).maybeSingle(),
          supabase.from("team_posts").select("*").order("created_at", { ascending: false }),
          supabase
            .from("join_requests")
            .select("*, team_posts(id, course, title, role, author_name)")
            .eq("applicant_id", DEMO_USER_ID)
            .order("created_at", { ascending: false }),
        ]);

        if (profileResult.error) throw profileResult.error;
        if (postsResult.error) throw postsResult.error;
        if (requestsResult.error) throw requestsResult.error;

        return {
          profile: profileResult.data,
          posts: postsResult.data || [],
          requests: requestsResult.data || [],
        };
      }, "Could not load Supabase data");

      if (!data) {
        setBackendStatus("Supabase configured, but tables may be missing");
        return;
      }

      if (data.profile) {
        const loadedProfile = {
          name: data.profile.name,
          major: data.profile.major,
          skills: data.profile.skills,
          role: data.profile.preferred_role,
          time: data.profile.available_time,
          introduction: data.profile.introduction || "",
        };
        setProfile(loadedProfile);
        setSavedProfile(loadedProfile);
        setProfileSavedAt(data.profile.updated_at ? new Date(data.profile.updated_at).toLocaleString() : "Loaded from Supabase");
      }

      const loadedPosts = data.posts.map(mapPost);
      const loadedRequests = data.requests.map(mapRequest);
      setPosts(loadedPosts.length ? loadedPosts : initialPosts);
      setSentRequests(loadedRequests);
      if (loadedPosts.length) setSelectedPost(loadedPosts[0]);
      setBackendStatus("Supabase connected");
    };

    loadData();
  }, []);

  const handleSaveProfile = async () => {
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

    const savedRow = await runSupabase(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: DEMO_USER_ID,
            name: normalizedProfile.name,
            major: normalizedProfile.major,
            skills: normalizedProfile.skills,
            preferred_role: normalizedProfile.role,
            available_time: normalizedProfile.time,
            introduction: normalizedProfile.introduction,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    }, "Saved locally because Supabase is not configured");

    setProfile(normalizedProfile);
    setSavedProfile(normalizedProfile);
    setProfileSavedAt(savedRow?.updated_at ? new Date(savedRow.updated_at).toLocaleString() : new Date().toLocaleString());
    showToast(savedRow ? "Profile saved to Supabase" : "Profile saved locally");
  };

  const resetPostForm = () => {
    setPostForm(emptyPostForm);
    setEditingPostId(null);
  };

  const handleCreateOrUpdatePost = async () => {
    const parsedSkills = postForm.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!postForm.title.trim() || !postForm.course.trim() || parsedSkills.length === 0) {
      showToast("Please fill in required post information");
      return;
    }

    const postPayload = {
      course: postForm.course.trim(),
      title: postForm.title.trim(),
      role: postForm.role.trim() || "Team Member",
      skills: parsedSkills,
      time: postForm.time.trim() || "Flexible",
      recruitCount: Number(postForm.recruitCount) || 1,
      description: postForm.description.trim(),
    };

    if (isEditingPost) {
      const updatedFromDb = await runSupabase(async () => {
        const { data, error } = await supabase
          .from("team_posts")
          .update({
            course: postPayload.course,
            title: postPayload.title,
            role: postPayload.role,
            skills: postPayload.skills,
            available_time: postPayload.time,
            recruit_count: postPayload.recruitCount,
            description: postPayload.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPostId)
          .select()
          .single();

        if (error) throw error;
        return mapPost(data);
      }, "Post updated locally because Supabase is not configured");

      const updatedPost = updatedFromDb || { ...selectedPost, ...postPayload };
      setPosts(posts.map((post) => (post.id === editingPostId ? updatedPost : post)));
      setSelectedPost(updatedPost);
      setSentRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.postId === editingPostId
            ? { ...request, postTitle: updatedPost.title, course: updatedPost.course, role: updatedPost.role, receiver: updatedPost.author }
            : request
        )
      );
      resetPostForm();
      setScreen("detail");
      showToast(updatedFromDb ? "Team post updated in Supabase" : "Team post updated locally");
      return;
    }

    const createdFromDb = await runSupabase(async () => {
      const { data, error } = await supabase
        .from("team_posts")
        .insert({
          author_id: DEMO_USER_ID,
          author_name: savedProfile.name,
          course: postPayload.course,
          title: postPayload.title,
          role: postPayload.role,
          skills: postPayload.skills,
          available_time: postPayload.time,
          recruit_count: postPayload.recruitCount,
          description: postPayload.description,
        })
        .select()
        .single();

      if (error) throw error;
      return mapPost(data);
    }, "Post created locally because Supabase is not configured");

    const newPost = createdFromDb || { id: Date.now(), ...postPayload, author: savedProfile.name };
    setPosts([newPost, ...posts]);
    setSelectedPost(newPost);
    setFilter("All");
    setRequestStatus("Not Sent");
    resetPostForm();
    setScreen("detail");
    showToast(createdFromDb ? "Team post created in Supabase" : "Team post created locally");
  };

  const handleStartEditPost = () => {
    setEditingPostId(selectedPost.id);
    setPostForm({
      course: selectedPost.course,
      title: selectedPost.title,
      role: selectedPost.role,
      skills: selectedPost.skills.join(", "),
      time: selectedPost.time,
      recruitCount: selectedPost.recruitCount,
      description: selectedPost.description,
    });
    setScreen("create");
  };

  const handleDeletePost = async () => {
    await runSupabase(async () => {
      const { error } = await supabase.from("team_posts").delete().eq("id", selectedPost.id);
      if (error) throw error;
      return true;
    }, "Post deleted locally because Supabase is not configured");

    const remainingPosts = posts.filter((post) => post.id !== selectedPost.id);
    setPosts(remainingPosts);
    setSentRequests((prevRequests) => prevRequests.filter((request) => request.postId !== selectedPost.id));
    setSelectedPost(remainingPosts[0] || initialPosts[0]);
    setRequestStatus("Not Sent");
    resetPostForm();
    setScreen("posts");
    showToast("Team post deleted");
  };

  const handleSendJoinRequest = async () => {
    const requestFromDb = await runSupabase(async () => {
      const { data, error } = await supabase
        .from("join_requests")
        .upsert(
          {
            post_id: selectedPost.id,
            applicant_id: DEMO_USER_ID,
            applicant_name: savedProfile.name,
            status: "Pending",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "post_id,applicant_id" }
        )
        .select("*, team_posts(id, course, title, role, author_name)")
        .single();

      if (error) throw error;
      return mapRequest(data);
    }, "Join request saved locally because Supabase is not configured");

    const newRequest =
      requestFromDb ||
      {
        id: Date.now(),
        postId: selectedPost.id,
        postTitle: selectedPost.title,
        course: selectedPost.course,
        role: selectedPost.role,
        receiver: selectedPost.author,
        applicant: savedProfile.name,
        status: "Pending",
        sentAt: new Date().toLocaleString(),
      };

    setSentRequests((prevRequests) => {
      const alreadySent = prevRequests.some((request) => request.postId === selectedPost.id);
      if (alreadySent) {
        return prevRequests.map((request) => (request.postId === selectedPost.id ? newRequest : request));
      }
      return [newRequest, ...prevRequests];
    });

    setRequestStatus("Pending");
    showToast(requestFromDb ? "Join request sent to Supabase" : "Join request sent locally");
  };

  const updateSelectedRequestStatus = async (status) => {
    if (!selectedRequest) {
      showToast("Please send a join request first");
      return;
    }

    const updatedFromDb = await runSupabase(async () => {
      const { data, error } = await supabase
        .from("join_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", selectedRequest.id)
        .select("*, team_posts(id, course, title, role, author_name)")
        .single();

      if (error) throw error;
      return mapRequest(data);
    }, "Request updated locally because Supabase is not configured");

    setRequestStatus(status);
    setSentRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === selectedRequest.id ? updatedFromDb || { ...request, status } : request
      )
    );
    showToast(status === "Accepted" ? "Request accepted" : "Request rejected");
  };

  const screens = [
    { id: "login", label: "Login", icon: LogIn },
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "create", label: isEditingPost ? "Edit Post" : "Create Post", icon: isEditingPost ? Pencil : PlusCircle },
    { id: "posts", label: "Team Posts", icon: Users },
    { id: "detail", label: "Post Detail", icon: FileText },
    { id: "myRequests", label: "My Sent Requests", icon: ListChecks },
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
            <p>Demo with React frontend and Supabase backend.</p>
          </div>

          <nav className="nav-list">
            {screens.map((item) => (
              <StepButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={screen === item.id}
                onClick={() => {
                  if (item.id === "create" && !isEditingPost) resetPostForm();
                  setScreen(item.id);
                }}
              />
            ))}
          </nav>

          <div className="scope-box">
            <p className="scope-title">Backend Status</p>
            <p>{backendStatus}</p>
            <p className="scope-title">Demo Scope</p>
            <p>Login → Profile → Create/Edit/Delete Post → Search Posts → Send Join Request → Track Request → Accept/Reject</p>
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
              <Header title="Login" subtitle="This screen represents the starting point of the team project matching platform." />
              <div className="two-column">
                <Card>
                  <label>Email</label>
                  <input defaultValue="minh@student.edu" />
                  <label>Password</label>
                  <input type="password" defaultValue="12345678" />
                  <Button className="full-width" onClick={() => { setScreen("profile"); showToast("Login successful"); }}>
                    <LogIn size={18} /> Login
                  </Button>
                </Card>
                <div className="dark-info-box">
                  <h3>Prototype Purpose</h3>
                  <p>This project now uses Supabase as the backend for profile data, team posts, and join request status tracking.</p>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header title="Student Profile" subtitle="Students enter structured information so other users can judge team fit more clearly." />
              <Card>
                <div className="form-grid">
                  {[["Name", "name"], ["Major", "major"], ["Skills", "skills"], ["Preferred Role", "role"], ["Available Time", "time"]].map(([label, key]) => (
                    <div key={key} className="field">
                      <label>{label}</label>
                      <input value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div className="field full-grid">
                    <label>Introduction</label>
                    <textarea value={profile.introduction} onChange={(e) => setProfile({ ...profile, introduction: e.target.value })} />
                  </div>
                </div>
                <div className="button-row">
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                  <Button variant="outline" onClick={() => { resetPostForm(); setScreen("create"); }}>Create Team Post</Button>
                  <Button variant="outline" onClick={() => setScreen("posts")}>Go to Team Posts</Button>
                </div>
                <div className="status-box">
                  <p>Saved Profile</p>
                  <span><CheckCircle2 size={17} /> {savedProfile.name} · {savedProfile.major} · {savedProfile.role}</span>
                  <p style={{ marginTop: 10 }}>Skills: {savedProfile.skills}</p>
                  <p>Available Time: {savedProfile.time}</p>
                  <p>Last Saved: {profileSavedAt}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {screen === "create" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header title={isEditingPost ? "Edit Team Post" : "Create Team Post"} subtitle={isEditingPost ? "Post authors can update recruitment information when project conditions change." : "Post authors enter structured recruitment conditions so applicants can compare teams clearly."} />
              <Card>
                <div className="form-grid">
                  {[["Course", "course"], ["Post Title", "title"], ["Required Role", "role"], ["Required Skills", "skills"], ["Available Time", "time"], ["Recruit Count", "recruitCount"]].map(([label, key]) => (
                    <div key={key} className="field">
                      <label>{label}</label>
                      <input type={key === "recruitCount" ? "number" : "text"} min={key === "recruitCount" ? "1" : undefined} value={postForm[key]} onChange={(e) => setPostForm({ ...postForm, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div className="field full-grid">
                    <label>Description</label>
                    <textarea value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} />
                  </div>
                </div>
                <div className="button-row">
                  <Button onClick={handleCreateOrUpdatePost}>{isEditingPost ? <Pencil size={18} /> : <PlusCircle size={18} />}{isEditingPost ? "Save Changes" : "Create Post"}</Button>
                  <Button variant="outline" onClick={() => { resetPostForm(); setScreen(isEditingPost ? "detail" : "posts"); }}>Cancel</Button>
                  <Button variant="outline" onClick={() => setScreen("posts")}>Back to Team Posts</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {screen === "posts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header title="Team Post List" subtitle="Students can browse structured team recruitment posts and filter them by course, skill, or available time." />
              <div className="button-row" style={{ marginBottom: 20 }}><Button onClick={() => { resetPostForm(); setScreen("create"); }}><PlusCircle size={18} /> Create New Post</Button></div>
              <div className="filter-row"><SlidersHorizontal size={18} />{filterOptions.map((item) => (<button key={item} onClick={() => setFilter(item)} className={`filter-chip ${filter === item ? "active" : ""}`}>{item}</button>))}</div>
              <div className="post-list">
                {filteredPosts.length === 0 ? <Card><p className="description">No team posts match the selected filter.</p></Card> : filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <div className="post-card-content">
                      <div>
                        <p className="eyebrow">{post.course}</p><h3>{post.title}</h3>
                        <div className="pill-row"><Pill>{post.role}</Pill><Pill>{post.time}</Pill>{post.skills.map((skill) => <Pill key={skill}>{skill}</Pill>)}</div>
                      </div>
                      <Button onClick={() => { setSelectedPost(post); const request = sentRequests.find((item) => item.postId === post.id); setRequestStatus(request?.status || "Not Sent"); setScreen("detail"); }}><Search size={17} /> View Detail</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {screen === "detail" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header title="Post Detail" subtitle="This page shows detailed recruitment conditions before the student sends a join request." />
              <Card>
                <p className="eyebrow">{selectedPost.course}</p><h2 className="detail-title">{selectedPost.title}</h2><p className="description">{selectedPost.description}</p>
                <div className="info-grid"><div><p>Required Role</p><strong>{selectedPost.role}</strong></div><div><p>Available Time</p><strong>{selectedPost.time}</strong></div><div><p>Recruit Count</p><strong>{selectedPost.recruitCount}</strong></div></div>
                <div className="pill-row spaced">{selectedPost.skills.map((skill) => <Pill key={skill}>{skill}</Pill>)}</div>
                <div className="button-row">
                  <Button onClick={handleSendJoinRequest}><Send size={18} /> Send Join Request</Button>
                  <Button variant="outline" onClick={handleStartEditPost}><Pencil size={18} /> Edit Post</Button>
                  <Button variant="outline" onClick={handleDeletePost}><Trash2 size={18} /> Delete Post</Button>
                  <Button variant="outline" onClick={() => setScreen("myRequests")}>My Sent Requests</Button>
                  <Button variant="outline" onClick={() => setScreen("posts")}>Back to Team Posts</Button>
                  <Button variant="outline" onClick={() => setScreen("requests")}>Open Request Management</Button>
                </div>
                <div className="status-box"><p>Request Status</p><span><Clock3 size={17} /> {currentRequestStatus}</span></div>
              </Card>
            </motion.div>
          )}

          {screen === "myRequests" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header title="My Sent Requests" subtitle="Students can check the status of join requests they have already sent." />
              {sentRequests.length === 0 ? <Card><p className="description">No join request has been sent yet. Open a post detail page and send a request first.</p><div className="button-row"><Button onClick={() => setScreen("posts")}>Browse Team Posts</Button></div></Card> : <div className="post-list">{sentRequests.map((request) => <Card key={request.id}><div className="post-card-content"><div><p className="eyebrow">{request.course}</p><h3>{request.postTitle}</h3><div className="pill-row"><Pill>{request.role}</Pill><Pill>To: {request.receiver}</Pill><Pill>Sent: {request.sentAt}</Pill></div></div><div className="current-status"><p>Status</p><strong>{request.status}</strong></div></div></Card>)}</div>}
            </motion.div>
          )}

          {screen === "requests" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Header title="Request Management" subtitle="The post author checks incoming join requests and accepts or rejects them." />
              <Card>
                <div className="request-layout"><div><p className="eyebrow">Incoming Request</p><h2>Request from {savedProfile.name}</h2><p className="description">{savedProfile.introduction}</p><div className="pill-row spaced"><Pill>{savedProfile.major}</Pill><Pill>{savedProfile.role}</Pill><Pill>{savedProfile.time}</Pill>{savedProfile.skills.split(",").slice(0, 4).map((skill) => <Pill key={skill.trim()}>{skill.trim()}</Pill>)}</div></div><div className="current-status"><p>Current Status</p><strong>{currentRequestStatus}</strong></div></div>
                <div className="button-row"><Button onClick={() => updateSelectedRequestStatus("Accepted")}><CheckCircle2 size={18} /> Accept</Button><Button variant="outline" onClick={() => updateSelectedRequestStatus("Rejected")}><XCircle size={18} /> Reject</Button><Button variant="outline" onClick={() => setScreen("myRequests")}>View Sent Requests</Button></div>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
