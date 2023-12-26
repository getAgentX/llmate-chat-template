# 🤖 NextJS AI Chat Bot

<!-- ![Project Image](url_to_project_image) -->

## Overview

Welcome to the NextJS AI Chat Bot project! This open-source chat bot is powered by NextJS and styled with Tailwind CSS. Users can deploy this chat bot by following the steps below.

## Getting Started

### Prerequisites

Before deploying the chat bot, make sure you have the following:

- 🚀 Node.js installed
- 🤖 A [llmate.ai](https://llmate.ai/) account
- 📲 An app created on llmate.ai to obtain the App ID and API Key

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/nextjs-ai-chat-bot.git
   cd nextjs-ai-chat-bot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root of the project and add the following variables:

   ```env
   NEXT_PUBLIC_API_URL=https://stream.llmate.ai/v1/integrate/
   NEXT_PUBLIC_LLMATE_API_URL=https://api.llmate.ai/v1/integrate/
   NEXT_PUBLIC_API_ID=your_llmate_app_id
   NEXT_PUBLIC_API_KEY=your_llmate_api_key
   ```

   Replace `your_llmate_app_id` and `your_llmate_api_key` with the App ID and API Key obtained from llmate.ai.

### Deployment

Follow these steps to deploy the NextJS website on Vercel:

1. **Create an account on Vercel:**

   Sign up at [Vercel](https://vercel.com/signup)

2. **Install the Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

3. **Log in to your Vercel account:**

   ```bash
   vercel login
   ```

4. **Deploy the project:**

   ```bash
   vercel
   ```

   Follow the on-screen instructions to configure your deployment.

## Usage

Once deployed, users can interact with the chat bot by visiting the deployed URL.

## Contributing

We welcome contributions! If you'd like to contribute to this project, please follow our [Contribution Guidelines](CONTRIBUTING.md).

## Customize and Extend

This project is open source, and we encourage users to customize and extend it according to their needs. Feel free to adapt the code to suit your requirements.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

Special thanks to llmate.ai for providing the AI capabilities for this chat bot.

## Contact

For questions or support, please contact [LLMate Support](https://www.llmate.ai/about-us).
