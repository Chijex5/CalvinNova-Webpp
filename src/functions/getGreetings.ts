type UserRole = 'buyer' | 'seller' | 'both' | 'agent' | 'admin';
interface GreetingResult {
  greeting: string;
  subMessage: string;
}
function getGreeting(userFullName: string, userRole: UserRole): GreetingResult {
  const firstName = userFullName.split(' ')[0];
  const styledFirstName = `<span class="text-indigo-600 dark:text-indigo-400">${firstName}</span>`;
  const currentHour = new Date().getHours();
  const currentDay = new Date().toLocaleDateString('en-US', {
    weekday: 'long'
  });

  // Time-based greeting determination
  let timeGreeting: string;
  if (currentHour < 12) {
    timeGreeting = 'Good morning';
  } else if (currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }

  // Generate a seed based on date to ensure consistency within the same day
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Use seeded random to pick greeting style (70% chance to include name)
  const includeNameInGreeting = seed % 10 < 7;

  // Main greeting variations with styled names
  const greetingVariations = [
  // With name (70% probability) - using styledFirstName
  ...(includeNameInGreeting ? [`${timeGreeting} ${styledFirstName}!`, `${timeGreeting}, ${styledFirstName}!`, `Hey ${styledFirstName}, ${timeGreeting.toLowerCase()}!`, `${timeGreeting} there, ${styledFirstName}!`, `Hello ${styledFirstName}! ${timeGreeting}!`, `${styledFirstName}! ${timeGreeting}!`, `Welcome back, ${styledFirstName}! ${timeGreeting}!`, `${timeGreeting} superstar ${styledFirstName}!`, `${styledFirstName}, ${timeGreeting.toLowerCase()} and welcome to CalvinNova!`, `Rise and shine, ${styledFirstName}! ${timeGreeting}!`, `${timeGreeting} ${styledFirstName}, ready for some marketplace magic?`, `Hey there ${styledFirstName}! ${timeGreeting}!`, `${styledFirstName}! Hope you're having a great ${timeGreeting.toLowerCase().replace('good ', '')}!`, `${timeGreeting} champion ${styledFirstName}!`, `Hello amazing ${styledFirstName}! ${timeGreeting}!`] : []),
  // Without name (30% probability)
  `${timeGreeting}!`, `${timeGreeting} there! `, `Hello! ${timeGreeting}!`, `${timeGreeting} and welcome to CalvinNova!`, `${timeGreeting} superstar!`, `Hey there! ${timeGreeting}!`, `Welcome back! ${timeGreeting}!`, `${timeGreeting} champion!`];

  // Fun variations based on day and time with styled names
  const funGreetings = [`In case you're wondering, ${styledFirstName}, today is ${currentDay}!`, `${styledFirstName}, it's ${currentDay} and the marketplace is buzzing!`, `Hope your ${currentDay} is going great, ${styledFirstName}!`, `${styledFirstName}, ready to make this ${currentDay} productive?`, `Another ${currentDay}, another opportunity, ${styledFirstName}!`, `${styledFirstName}, guess what? It's ${currentDay} and CalvinNova is alive with activity!`, `Fun fact ${styledFirstName}: It's ${currentDay} and the perfect day for marketplace adventures!`, `${styledFirstName}, in case you missed it, today is ${currentDay} and opportunities are calling!`, `Plot twist ${styledFirstName}: It's ${currentDay} and your next great deal awaits!`, `Breaking news ${styledFirstName}: It's ${currentDay} and the marketplace is on fire!`, `${styledFirstName}, friendly reminder that it's ${currentDay} and time to make moves!`, `Just saying ${styledFirstName}, it's ${currentDay} and the vibes are immaculate!`, `${styledFirstName}, today's forecast: ${currentDay} with a high chance of great deals!`, `Quick update ${styledFirstName}: It's ${currentDay} and CalvinNova is buzzing!`, `${styledFirstName}, in case your calendar is broken, it's ${currentDay} and time to shine!`, `Reality check ${styledFirstName}: It's ${currentDay} and the marketplace is waiting!`, `${styledFirstName}, spoiler alert: It's ${currentDay} and amazing things are happening!`];

  // Randomly pick between standard and fun greetings
  const useFunGreeting = seed % 4 === 0; // 25% chance for fun greeting

  let finalGreeting: string;
  if (useFunGreeting && includeNameInGreeting) {
    finalGreeting = funGreetings[seed % funGreetings.length];
  } else {
    finalGreeting = greetingVariations[seed % greetingVariations.length];
  }

  // Role-specific sub messages with styled names
  const getSubMessage = (): string => {
    const commonPrompts = ["Ready to explore what's new on CalvinNova?", "The marketplace is waiting for you!", "Time to discover great deals and opportunities!", "Your next great find might be just a click away!", "CalvinNova is buzzing with activity today!", "The student marketplace that never sleeps!", "Where students connect, buy, and sell with ease!", "Your campus marketplace adventure starts now!", "Join thousands of students making smart deals!", "The place where student needs meet student solutions!", "Discover, connect, and trade like never before!", "Your one-stop shop for all things student life!", "Where great deals and great students collide!", "The marketplace that understands student life!", "Ready to unlock amazing student deals?", "Your campus community is just a click away!", "Time to make your student budget work harder!", "Where smart students shop and sell smarter!"];
    const roleSpecificPrompts = {
      buyer: [`${styledFirstName}, looking for something special? Check out our marketplace!`, "Perfect day to find that item you've been searching for!", `In case you're wondering, ${styledFirstName}, we have amazing deals today!`, "Have you checked the marketplace lately? New items just dropped!", `${styledFirstName}, that perfect chair or gadget might be waiting for you!`, `${styledFirstName}, ready to score some incredible student deals?`, "Time to treat yourself to something amazing!", `${styledFirstName}, your wishlist items might just be available today!`, "New listings are pouring in - perfect timing!", `${styledFirstName}, someone just listed exactly what you need!`, "Your next favorite purchase is waiting to be discovered!", `${styledFirstName}, the deals today are absolutely unbeatable!`, "Browse, discover, and buy with confidence!", `${styledFirstName}, your student budget will thank you for these prices!`, "Time to turn your wants into haves!", `${styledFirstName}, the marketplace has some gems today!`, "Ready to find your next great purchase?", `${styledFirstName}, other students are sharing amazing items today!`, "Perfect day for some retail therapy, student-style!", `${styledFirstName}, your next must-have item is just a search away!`, "The best deals happen when you least expect them!", `${styledFirstName}, ready to discover what fellow students are offering?`, "Your campus marketplace has fresh inventory today!", `${styledFirstName}, time to make your dorm room dreams come true!`, "Smart shopping starts with smart browsing!"],
      seller: [`${styledFirstName}, ready to list something amazing today?`, "Perfect time to turn your unused items into cash!", `In case you're wondering, ${styledFirstName}, sellers are making great sales today!`, "Got something to sell? The marketplace is active right now!", `${styledFirstName}, your next sale could be just one listing away!`, `${styledFirstName}, time to declutter and make money doing it!`, "Your unused items could be someone else's treasure!", `${styledFirstName}, the marketplace is hungry for what you're selling!`, "Ready to turn your stuff into student cash?", `${styledFirstName}, other students are actively buying today!`, "Perfect day to clear out and cash in!", `${styledFirstName}, your items deserve new homes and you deserve the money!`, "List it, sell it, profit from it!", `${styledFirstName}, someone is searching for exactly what you have!`, "Time to be the solution to another student's problem!", `${styledFirstName}, your closet clean-out could fund your weekend!`, "Ready to become someone's marketplace hero?", `${styledFirstName}, those textbooks won't sell themselves!`, "Turn your pre-loved items into post-loved cash!", `${styledFirstName}, the marketplace is your personal ATM today!`, "Every item you list is money in your pocket!", `${styledFirstName}, ready to make space and make money?`, "Your selling game is about to level up!", `${styledFirstName}, time to be the seller everyone's been waiting for!`, "List once, profit forever (or at least until it sells)!"],
      both: [`${styledFirstName}, ready to buy, sell, or both today?`, "Perfect day for some marketplace action - buying or selling!", `In case you're wondering, ${styledFirstName}, opportunities are everywhere today!`, "Whether buying or selling, the marketplace has something for you!", `${styledFirstName}, double the possibilities await you today!`, `${styledFirstName}, today's agenda: buy something cool, sell something cooler!`, "Why choose? You can buy AND sell today!", `${styledFirstName}, your marketplace superpowers are unlimited!`, "Ready to be both the buyer and seller extraordinaire?", `${styledFirstName}, double the fun, double the opportunities!`, "Buy what you need, sell what you don't!", `${styledFirstName}, you're about to dominate both sides of the marketplace!`, "Perfect balance: acquire new treasures, release old ones!", `${styledFirstName}, why be one-dimensional when you can do both?`, "Your marketplace journey has no limits today!", `${styledFirstName}, time to buy low, sell high, repeat!`, "Ready to master the art of marketplace multitasking?", `${styledFirstName}, you're the complete package - buyer AND seller!`, "Double the marketplace, double the excitement!", `${styledFirstName}, today you can be everyone's favorite person!`, "Buy someone's treasure, sell your own!", `${styledFirstName}, your versatility is your marketplace superpower!`, "Ready to flip the script from buyer to seller?", `${styledFirstName}, the marketplace is your playground today!`, "Why limit yourself? Be the marketplace MVP!"],
      agent: [`${styledFirstName}, ready to help students connect today?`, "Your referrals are making a difference on CalvinNova!", `In case you're wondering, ${styledFirstName}, the community is growing thanks to agents like you!`, "Time to spread the word about CalvinNova!", `${styledFirstName}, every referral helps build our amazing community!`, `${styledFirstName}, ready to be someone's marketplace hero today?`, "Your network is your net worth - time to share CalvinNova!", `${styledFirstName}, you're the bridge between students and opportunities!`, "Ready to turn conversations into connections?", `${styledFirstName}, your referrals are building the future of student commerce!`, "Time to be the friend who introduces friends to greatness!", `${styledFirstName}, you're not just an agent, you're a community builder!`, "Ready to expand the CalvinNova family?", `${styledFirstName}, your influence is helping students nationwide!`, "Every referral is a seed for a thriving marketplace!", `${styledFirstName}, you're the reason students discover amazing deals!`, "Time to make introductions that change student lives!", `${styledFirstName}, your network is about to meet their new favorite app!`, "Ready to be the catalyst for student success stories?", `${styledFirstName}, you're creating connections that matter!`, "Your referrals today could be tomorrow's success stories!", `${styledFirstName}, ready to share the CalvinNova magic?`, "Time to turn your social capital into student value!", `${styledFirstName}, you're the link between students and their dreams!`, "Every introduction you make strengthens our community!"],
      admin: [`${styledFirstName}, the marketplace is running smoothly thanks to you!`, "Ready to oversee another great day on CalvinNova?", `In case you're wondering, ${styledFirstName}, everything looks great from the admin view!`, "The community is thriving under your watch!", `${styledFirstName}, another day of keeping CalvinNova amazing!`, `${styledFirstName}, ready to make the marketplace magic happen?`, "Your admin superpowers are needed today!", `${styledFirstName}, time to ensure everything runs like clockwork!`, "The platform's success is in your capable hands!", `${styledFirstName}, ready to be the behind-the-scenes hero?`, "Another day, another opportunity to excel in excellence!", `${styledFirstName}, the marketplace orchestra needs its conductor!`, "Ready to keep the student community thriving?", `${styledFirstName}, your attention to detail makes all the difference!`, "Time to ensure every student has an amazing experience!", `${styledFirstName}, you're the guardian of marketplace greatness!`, "Ready to orchestrate another successful day?", `${styledFirstName}, the platform's reliability depends on your expertise!`, "Another day to showcase your administrative excellence!", `${styledFirstName}, time to make sure everything is perfectly perfect!`, "Your vigilance keeps the CalvinNova dream alive!", `${styledFirstName}, ready to be the unsung hero of student success?`, "The marketplace's heartbeat syncs with your dedication!", `${styledFirstName}, another day to prove that great admins make great platforms!`, "Ready to ensure every click leads to student satisfaction?"]
    };

    // Mix role-specific and common prompts
    const rolePrompts = roleSpecificPrompts[userRole] || commonPrompts;
    const allPrompts = [...rolePrompts, ...commonPrompts];
    return allPrompts[seed % allPrompts.length];
  };
  return {
    greeting: finalGreeting,
    subMessage: getSubMessage()
  };
}

// Example usage:
// const greeting = getGreeting("Chijioke Okafor", "buyer");
// console.log(`${greeting.greeting} ${greeting.subMessage}`);

export { getGreeting, type UserRole, type GreetingResult };