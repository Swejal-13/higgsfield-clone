import { api } from "./client";
import { Project, Asset, Generation } from "@/types";

export async function listProjects() {
  const { data } = await api.get("/projects");
  return data.data.projects as Project[];
}

export async function createProjectRequest(name: string, description?: string) {
  const { data } = await api.post("/projects", { name, description });
  return data.data.project as Project;
}

export async function getProjectDetail(id: string) {
  const { data } = await api.get(`/projects/${id}`);
  return data.data as { project: Project; assets: Asset[]; generations: Generation[] };
}

export async function deleteProjectRequest(id: string) {
  await api.delete(`/projects/${id}`);
}
