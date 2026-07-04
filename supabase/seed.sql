-- =========================================================
-- Together — seed data
-- Run this AFTER schema.sql, in the SQL Editor
-- =========================================================

insert into public.groups (name, description, color) values
  ('Art Friends', 'Share your art, get gentle feedback, find your people.', '#D9D0FF'),
  ('Gamers Club', 'Co-op buddies, game chat, no toxicity allowed.', '#8FE3E0'),
  ('New School Support', 'Starting somewhere new? You''re not doing it alone.', '#FFD56B'),
  ('Social Anxiety Support', 'A calm space to talk about the hard social stuff.', '#9AD0F5'),
  ('Confidence Builders', 'Small wins, big support, every single day.', '#FFB199');

insert into public.badges (name, icon, description) values
  ('Super Supporter', '💜', 'Sent support 50+ times'),
  ('Friendship Pro', '🤝', 'Made 10 new friends'),
  ('Kind Soul', '🌟', 'Left 25 kind comments');
