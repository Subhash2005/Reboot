# 🛠️ Reboot Database Setup Guide

Since MySQL is not currently detected on your system, follow one of these two paths to get your database running.

---

## Option 1: XAMPP (Recommended for MySQL)
XAMPP provides a local server with MySQL and a web interface (phpMyAdmin) to manage it.

1.  **Download & Install**: 
    - Download [XAMPP for Windows](https://www.apachefriends.org/download.html).
    - Install it (keep defaults).
2.  **Start MySQL**:
    - Open the **XAMPP Control Panel**.
    - Click **Start** next to "MySQL".
3.  **Create the Database**:
    - Click **Admin** next to "MySQL" to open **phpMyAdmin** in your browser.
    - Go to the **SQL** tab.
    - Copy all content from your project's `backend/schema.sql` and paste it there.
    - Click **Go** to run.
4.  **Update Your .env**:
    - Your `backend/.env` should look like this (default for XAMPP):
      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASS=
      DB_NAME=reboot_db
      ```

---

## Option 2: SQLite (Fastest / No Installation)
If you don't want to install MySQL, I can convert the project to use SQLite. This stores the database in a simple file within your `backend` folder.

> [!NOTE]
> If you prefer this, just tell me: **"Switch to SQLite"**, and I will update all the code for you in a few seconds.

---

## How to Verify
Once you've done the steps in Option 1:
1. Restart your backend: `cd backend` then `npm run dev`.
2. Look for "Server running on port 5000" and no error messages.
3. Try registering a new user on the website!
