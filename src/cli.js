import { createProject } from "./main";

export function cli(args) {
  const [projectName] = args.slice(2);
  createProject(projectName);
}
