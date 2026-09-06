/**
 * Byline accounts for the blog.
 *
 * Blog.author is a required ref to User, so an author has to be a user row.
 *
 * These are created with status "suspended" and a random 48-char password that
 * is generated at seed time and never printed or stored anywhere else: they are
 * bylines, not logins. Both `protect` and `login` reject a non-active account,
 * so none of them is an access path.
 *
 * To give one of these people real access, activate the account and set a
 * password from /admin/users — do not change the status in this file.
 */

export const authors = [
  {
    "key": "arif",
    "name": "Md. Arif",
    "email": "arif@strsltd.com",
    "avatar": "/arif.png",
    "role": "admin",
    "status": "suspended"
  },
  {
    "key": "showfydul",
    "name": "S M Showfydul Islam",
    "email": "showfydul@strsltd.com",
    "avatar": "/sm.jpeg",
    "role": "admin",
    "status": "suspended"
  },
  {
    "key": "mahmud",
    "name": "Mahmud Hasan, PhD",
    "email": "mahmud@strsltd.com",
    "avatar": "/datascientis.jpg",
    "role": "admin",
    "status": "suspended"
  }
];

export default authors;
