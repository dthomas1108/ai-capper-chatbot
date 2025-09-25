import express from 'express';
import { getData } from './data/getData.js';

const router = express.Router();
const data = getData();

router.get('/handicappers', (req, res) => {
    res.json(data.handicappers);
});

router.get('/packages', (req, res) => {
    res.json(data.packages);
});

router.get('/handicappers/:id', (req, res) => {
    const capper = data.handicappers.find(cap => cap.id === req.params.id);
    if (!capper) {
        return res.status(404).json({ error: 'Handicapper not found' });
    }
    res.json(capper);
});

router.get('/packages/:id', (req, res) => {
    const pkg = data.packages.find(pack => pack.id === req.params.id);
    if (!pkg) {
        return res.status(404).json({ error: 'Package not found' });
    }
    res.json(pkg);
});

// Example: get all packages for a handicapper
router.get('/handicappers/:id/packages', (req, res) => {
    const pkgs = data.packages.filter(p => p.handicapperId === req.params.id);
    res.json(pkgs);
});

export default router;