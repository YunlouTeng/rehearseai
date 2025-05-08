# Connecting to GitHub

After creating your GitHub repository, follow these steps to connect your local repository to GitHub and push your code:

## Add the remote origin

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/RehearseAI.git
```

## Push your code

Push your code to the main branch:

```bash
git push -u origin main
```

You may need to authenticate with GitHub at this point. If you're using HTTPS, you'll be asked for your GitHub username and password (or personal access token).

## Verify the push

Visit your GitHub repository at `https://github.com/YOUR_USERNAME/RehearseAI` to confirm that your code has been pushed successfully.

## Set up GitHub authentication

If you haven't already set up authentication with GitHub, you might want to:

1. Configure SSH keys for secure authentication:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   
2. Add the SSH key to your GitHub account:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output and add it to your GitHub account under Settings > SSH and GPG keys.

3. Test your SSH connection:
   ```bash
   ssh -T git@github.com
   ```

## Switch from HTTPS to SSH (optional)

If you initially set up with HTTPS but want to use SSH:

```bash
git remote set-url origin git@github.com:YOUR_USERNAME/RehearseAI.git
``` 