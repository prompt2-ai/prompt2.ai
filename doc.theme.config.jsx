import Image from 'next/image';

const redirectTohome = () => {
    window.location.href = '/';
  };


export default {
    logo: <span><Image src="/logo.svg" onClick={()=>redirectTohome()} alt="P2?" width={40} height={40} /></span>,
    footer: {
      component:<div class="nx-mx-auto nx-flex nx-max-w-[90rem] nx-justify-center nx-py-12 nx-text-gray-600 dark:nx-text-gray-400 md:nx-justify-start nx-pl-[max(env(safe-area-inset-left),1.5rem)] nx-pr-[max(env(safe-area-inset-right),1.5rem)]">© 2024 Prompt2</div>
      },
    project: {
      link: 'https://github.com/prompt2-ai/prompt2.ai'
    },
    docsRepositoryBase:'https://github.com/prompt2-ai/prompt2.ai/tree/main'
    // ... other theme options
     
  }