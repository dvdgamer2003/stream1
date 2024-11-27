-- Users table
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Video links table
create table video_links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  title text not null,
  video_url text not null,
  cloudinary_id text not null,
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index video_links_user_id_idx on video_links(user_id);
create index video_links_title_idx on video_links(title);

-- Enable Row Level Security
alter table users enable row level security;
alter table video_links enable row level security;

-- Create policies
create policy "Users can view their own data" on users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on users
  for update using (auth.uid() = id);

create policy "Users can view their own videos" on video_links
  for select using (auth.uid() = user_id);

create policy "Users can insert their own videos" on video_links
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own videos" on video_links
  for delete using (auth.uid() = user_id);
