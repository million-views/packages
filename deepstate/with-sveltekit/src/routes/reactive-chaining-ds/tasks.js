export default [
  {
    id: 1,
    name: "Task 1",
    requirements: [],
  },
  {
    id: 2,
    name: "Task 2",
    requirements: [],
  },
  {
    id: 3,
    name: "Task 3",
    requirements: [
      { id: "r1", requiredTaskId: 1, requiredState: "ongoing" },
      { id: "r2", requiredTaskId: 2, requiredState: "ongoing" },
    ],
  },
  {
    id: 4,
    name: "Task 4",
    requirements: [
      { id: "r3", requiredTaskId: 1, requiredState: "completed" },
      { id: "r4", requiredTaskId: 2, requiredState: "completed" },
      { id: "r5", requiredTaskId: 3, requiredState: "ongoing" },
    ],
  },
];
