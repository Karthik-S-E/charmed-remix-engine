# Create a permanent admin login

Right now the store has no registered users at all, so no admin credentials exist. This creates one fixed admin account you can use forever to add, edit and delete products.

## What you'll get

A confirmed admin account, ready to log in immediately (no email link needed):

- Email: `admin@kandammakids.com`
- Password: `Kandamma@Admin2026`

You can change the password later from the login page's "forgot password" flow if you'd like something private.

## What happens

1. Remove any leftover half-created accounts so we start clean (there are none right now, but the step is safe either way).
2. Create the account with email already confirmed, so login works instantly.
3. Give it the admin role, and give it a customer profile record like every other user.
4. Verify by logging in through the site and checking that the Admin page opens, then add, edit and delete a test product to confirm all three actions work.

## Notes

- The account is created straight in the backend, so it is not affected by the email-confirmation requirement that normal signups have.
- Since this is a real, working login, treat the password as private once the site is live — anyone with it can change your products.

## Technical details

- Delete existing rows from `auth.users` (cascades to `profiles` and `user_roles`).
- Insert the admin user via the backend admin API with `email_confirm: true`, then insert `user_roles(user_id, 'admin')`, replacing the default `customer` row created by the `on_auth_user_created_role` trigger.
- Verify admin CRUD against `products` under the existing "Admins can manage products" policy using a headless browser session.
