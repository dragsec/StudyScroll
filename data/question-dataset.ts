import aws from "@/datasets/questions/v1/aws.json";
import calculus from "@/datasets/questions/v1/calculus.json";
import discreteMaths from "@/datasets/questions/v1/discrete-maths.json";
import docker from "@/datasets/questions/v1/docker.json";
import dsa from "@/datasets/questions/v1/dsa.json";
import java from "@/datasets/questions/v1/java.json";
import javascript from "@/datasets/questions/v1/javascript.json";
import linux from "@/datasets/questions/v1/linux.json";
import networking from "@/datasets/questions/v1/networking.json";
import operatingSystems from "@/datasets/questions/v1/operating-systems.json";
import python from "@/datasets/questions/v1/python.json";
import springBoot from "@/datasets/questions/v1/spring-boot.json";
import sql from "@/datasets/questions/v1/sql.json";
import systemDesign from "@/datasets/questions/v1/system-design.json";
import type { Difficulty, Topic, Verdict } from "@/data/question-types";

export type DatasetTopicFile = {
  schema_version: string;
  dataset_version: string;
  topic: { id: string; name: Topic };
  questions: Array<{
    id: string;
    difficulty: Difficulty;
    prompt: string;
    context?: string;
    answers: Array<{
      id: "a" | "b" | "c";
      text: string;
      verdict: Verdict;
      feedback: Record<Verdict, string>;
    }>;
    reference: { title: string; url: string };
    review_status: "draft" | "approved" | "rejected";
  }>;
};

export const questionDatasetFiles = [
  aws,
  calculus,
  discreteMaths,
  docker,
  dsa,
  java,
  javascript,
  linux,
  networking,
  operatingSystems,
  python,
  springBoot,
  sql,
  systemDesign,
] as unknown as DatasetTopicFile[];
