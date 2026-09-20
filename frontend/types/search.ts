export interface SearchResults {
  courses: { _id: string; name: string; category?: string }[];
  modules: { _id: string; name: string; course: { _id: string; name: string } }[];
  topics: { _id: string; name: string; course: { _id: string; name: string }; module: { _id: string; name: string } }[];
  lessons: {
    _id: string;
    title: string;
    course: { _id: string; name: string };
    module: { _id: string; name: string };
    topic: { _id: string; name: string };
  }[];
}
