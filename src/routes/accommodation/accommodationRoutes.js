import express from 'express';
import {
  createAccommodation,
  getAccommodations,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getMyListings,
  getPendingListings,
  getAllListingsAdmin,
  toggleAvailability,
  toggleDeactivate,
  updateRoomAvailability,
  approveAccommodation,
} from '../../controllers/accommodation/accommodationController.js';


const router = express.Router();

// ── Public ──
router.get('/all', getAccommodations);

// // ── Owner ──
router.get('/my/listings', getMyListings);//, protect, authorize('owner', 'admin'),
router.post('/create', createAccommodation);//protect, authorize('owner', 'admin'),

// ── Owner Actions ──
router.put('/:id', updateAccommodation);//protect, authorize('owner', 'admin'),
router.delete('/:id', deleteAccommodation); //""
router.patch('/:id/availability', toggleAvailability);//""
router.patch('/:id/deactivate', toggleDeactivate);//""
router.patch('/:id/rooms/:roomTypeId', updateRoomAvailability);//""

// ── Public Single ──
router.get('/:id', getAccommodation);

// ── Admin ──
router.get('/admin/pending', getPendingListings); // protect, authorize('admin'),
router.get('/admin/all', getAllListingsAdmin);
router.patch('/:id/approve', approveAccommodation);


export default router;