import { CurriculumCourseDef } from "./types";
import { curriculum as mern } from "./mern.curriculum";
import { curriculum as frontendReact } from "./frontend-react.curriculum";
import { curriculum as pythonFullStack } from "./python-fullstack.curriculum";
import { curriculum as dataScience } from "./data-science.curriculum";
import { curriculum as aiMl } from "./ai-ml.curriculum";
import { curriculum as digitalMarketing } from "./digital-marketing.curriculum";
import { curriculum as wordpress } from "./wordpress.curriculum";

/** One entry per course, added as each course's rich content is authored. An entry whose
 * `courseName` doesn't match a seeded Course is silently skipped by seedCurriculum(). */
export const curriculumDefs: CurriculumCourseDef[] = [
  mern,
  frontendReact,
  pythonFullStack,
  dataScience,
  aiMl,
  digitalMarketing,
  wordpress,
];
