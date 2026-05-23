export const DEMO_USER_ID = "demo-user";

export function mapPost(row) {
  return {
    id: row.id,
    course: row.course,
    title: row.title,
    role: row.role,
    skills: row.skills || [],
    time: row.available_time,
    recruitCount: row.recruit_count,
    author: row.author_name,
    description: row.description,
  };
}
