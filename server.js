const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6700;
const fs = require('fs');
const path = require('path');


const dbPath = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper to read db.json
function readDB(callback) {
  fs.readFile(dbPath, 'utf8', (err, jsonData) => {
    if (err) return callback(err);
    const db = JSON.parse(jsonData);
    callback(null, db);
  });
}

// latest movies
app.get('/latest', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(db.latest);
  });
});

// upcoming movies
app.get('/upcomingMovies', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(db.upcomingMovies);
  });
});

// one upcoming movie by ID
app.get('/upcoming/:id', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    const movie = db.upcomingMovies.find(m => m.id === req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  });
});

// all events
app.get('/events', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(db.events);
  });
});

// one event by ID
app.get('/events/:id', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });
});

// all users
app.get('/users', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    res.json(db.users);
  });
});

// one user by ID
app.get('/users/:id', (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
});

// add new user
app.post('/users', (req, res) => {
  const newUser = req.body;
  newUser.id = Math.random().toString(36).substr(2, 4);

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });

    db.users.push(newUser);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), err => {
      if (err) return res.status(500).json({ error: "Failed to write data" });
      res.status(201).json({ message: "User added successfully", user: newUser });
    });
  });
});
//getting booking
app.get('/bookings', (req, res) => {
  const { user } = req.query;

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });

    if (!user) {
      return res.json(db.bookings); // if no user filter, return all
    }

    const userBookings = db.bookings.filter(b => b.user === user);
    res.json(userBookings);
  });
});
// post bookng
app.post('/bookings', (req, res) => {
  const newBooking = req.body;
  newBooking.id = Math.random().toString(36).substr(2, 4); // simple id

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });

    db.bookings.push(newBooking);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), err => {
      if (err) return res.status(500).json({ error: "Failed to save booking" });
      res.status(201).json({ message: "Booking saved", booking: newBooking });
    });
  });
});

// deleted bookings
app.delete('/bookings/:id', (req, res) => {
  const bookingId = req.params.id;

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Server error" });

    const newBookings = db.bookings.filter(b => b.id !== bookingId);

    if (newBookings.length === db.bookings.length) {
      return res.status(404).json({ error: "Booking not found" });
    }

    db.bookings = newBookings;

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), err => {
      if (err) return res.status(500).json({ error: "Failed to delete booking" });
      res.json({ message: "Booking deleted" });
    });
  });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
