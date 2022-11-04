import ToDoList from "../islands/ToDoList.tsx";
import { Head } from "$fresh/runtime.ts";

export default () => (
  <>
    <Head>
      <title>Todo app</title>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <link rel="stylesheet" href="style.css" />
    </Head>
    <div class="flex justify-center items-center h-full">
      <ToDoList />
    </div>
  </>
);
