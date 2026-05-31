const path = require('path');
const { createApp } = require('../src/app');

const app = createApp();

app.static(path.join(__dirname, '../public'));

// In-memory data store
const assignments = [
  { id: '1', title: 'HTTP Server', course: 'Full Stack', dueDate: '2026-06-12', done: true },
  { id: '2', title: 'Assignment 2', course: 'Operating Systems', dueDate: '2026-06-13', done: false },
  { id: '3', title: 'Assignment 10', course: 'Intro To Statistics', dueDate: '2026-06-9', done: false },
];

let nextId = 4;

app.group('/api/assignments', (router) => {
  // GET all assignments
  router.get('/', () => assignments);

  // GET single assignment
  router.get('/:id', (req) => {
    const assignment = assignments.find((a) => a.id === req.params.id);
    if (!assignment) return { error: 'Assignment not found' };
    return assignment;
  });

  // POST create assignment
  router.post('/', (req, res) => {
    const { title, course, dueDate } = req.body;
    const assignment = {
      id: String(nextId++),
      title,
      course,
      dueDate,
      done: false,
    };
    assignments.push(assignment);
    res.status(201).json(assignment);
  });

  // PUT mark as done/undone
  router.put('/:id', (req) => {
    const assignment = assignments.find((a) => a.id === req.params.id);
    if (!assignment) return { error: 'Assignment not found' };
    assignment.done = req.body.done ?? !assignment.done;
    return assignment;
  });

  // DELETE assignment
  router.delete('/:id', (req, res) => {
    const index = assignments.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    assignments.splice(index, 1);
    res.status(200).json({ deleted: true });
  });
});

app.listen(3000, () => {
  console.log('Assignment tracker running on http://localhost:3000');
});
