import { Injectable, NotFoundException } from "@nestjs/common";

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: "author 1",
    title: "title 1",
    content: "content 1",
    likeCount: 1,
    commentCount: 1,
  },
  {
    id: 2,
    author: "author 2",
    title: "title 2",
    content: "content 2",
    likeCount: 2,
    commentCount: 2,
  },
  {
    id: 3,
    author: "author 3",
    title: "title 3",
    content: "content 3",
    likeCount: 3,
    commentCount: 3,
  },
];

@Injectable()
export class PostsService {
  getAllPosts() {
    return posts;
  }

  getPostById(postId: number) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts = [...posts, post];

    return post;
  }

  updatePost(postId: number, author: string, title: string, content: string) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    posts = posts.map((prevPost) => (prevPost.id === postId ? post : prevPost));

    return post;
  }

  deletePost(postId: number) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }

    posts = posts.filter((post) => post.id !== postId);

    return postId;
  }
}
