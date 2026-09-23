create table posts (
    id uuid primary key default gen_random_uuid(),
    content text not null check (char_length(content) between 1 and 1000),
    category text not null default 'thought'
        check (category in ('thought', 'idea', 'confession')),
    likes_count integer not null default 0,
    created_at timestamptz not null default now()
);

alter table posts enable row level security;

-- Anyone can read posts
create policy "Anyone can read posts"
on posts
for select
to anon
using (true);

-- Anyone can create a post
create policy "Anyone can create posts"
on posts
for insert
to anon
with check (
    char_length(content) between 1 and 1000
    and category in ('thought', 'idea', 'confession')
);

-- Don't allow anonymous users to update/delete posts