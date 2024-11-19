export const fetchAndAggregateData = async (): Promise<any[]> => {
    try {
      const [postsResponse, usersResponse] = await Promise.all([
        fetch('https://jsonplaceholder.typicode.com/posts'),
        fetch('https://jsonplaceholder.typicode.com/users'),
      ]);
  
      if (!postsResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch data from one of the APIs');
      }
  
      const posts = (await postsResponse.json()) as any[];
      const users = (await usersResponse.json()) as any[];
  
      const aggregatedData = users.map((user) => {
        const userPosts = posts.filter((post) => post.userId === user.id);
        return { ...user, posts: userPosts };
      });  
      return aggregatedData;
    } catch (error: any) {
      console.error('Error in fetchAndAggregateData:', error.message);
      throw error;
    }
  };