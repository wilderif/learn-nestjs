import { join } from "path";

// 서버 프로젝트의 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd();

// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_DIRECTORY_NAME = "public";

// 포스트 이미지들을 저장하는 폴더 이름
export const POSTS_DIRECTORY_NAME = "posts";

// 실제 공개 폴더의 절대 경로
// /{프로젝트의 위치}/public
export const PUBLIC_DIRECTORY_PATH = join(
  PROJECT_ROOT_PATH,
  PUBLIC_DIRECTORY_NAME,
);

// 포스트 이미지들을 저장하는 폴더의 절대 경로
// /{프로젝트의 위치}/public/posts
export const POST_IMAGE_PATH = join(
  PUBLIC_DIRECTORY_PATH,
  POSTS_DIRECTORY_NAME,
);

// http://localhost:3000 + /public/posts/xxx.png
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_DIRECTORY_NAME,
  POSTS_DIRECTORY_NAME,
);
