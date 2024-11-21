import Link from 'next/link';

const writings = [
  { id: "aws-ec2-deployment", title: "Deploying Golang and React Applications on AWS EC2", date: "2024-11-21" },
  { id: "big-firms-vs-startups", title: "Why Established Companies Lag in Product Development Compared to Startups", date: "2024-10-30" },
  { id: "AI-driven-sdlc", title: "The AI-Driven Software Revolution: Reimagining the Development Lifecycle with Intelligent Agents", date: "2024-09-26" },
  { id: "go-htmx", title: "Go + HTMX - Modern Web Development", date: "2024-09-10" },


];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <ul className="space-y-8">
        {writings.map((writing) => (
          <li key={writing.id}>
            <Link href={`/writings/${writing.id}`} className="block hover:bg-gray-50 transition-colors duration-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{writing.title}</h2>
              <p className="text-gray-600">{formatDate(writing.date)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}