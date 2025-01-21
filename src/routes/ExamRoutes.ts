import express, { Request, Response } from 'express';
import { OnlineExam } from '../models/OnlineExam';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const exams = await OnlineExam.find({ userId });
    res.json(exams);
  } catch (err) {
    console.error('Error fetching exams:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, date, duration } = req.body;
  const userId = req.userId;

  if (!title || !description || !date || !duration) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const newExam = new OnlineExam({ title, description, date, duration, userId });
    await newExam.save();
    res.status(201).json(newExam);
  } catch (err) {
    console.error('Error saving exam:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, date, duration } = req.body;
  const userId = req.userId;

  if (!title || !description || !date || !duration) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const updatedExam = await OnlineExam.findOneAndUpdate(
      { _id: id, userId },
      { title, description, date, duration },
      { new: true }
    );

    if (!updatedExam) {
      res.status(404).json({ error: 'Exam not found or unauthorized' });
      return;
    }

    res.json(updatedExam);
  } catch (err) {
    console.error('Error updating exam:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const exam = await OnlineExam.findOneAndDelete({ _id: id, userId });
    if (!exam) {
      res.status(404).json({ error: 'Exam not found or unauthorized' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting exam:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;