app.get('/health', (_req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Event Management API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rsvp', rsvpRoutes);

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
