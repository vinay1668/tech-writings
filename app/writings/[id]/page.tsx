import { getPostData, getAllPostIds } from '../../../lib/writings'
export async function generateStaticParams() {
    const paths = getAllPostIds()
    return paths
}

export default async function Post({ params }: { params: { id: string } }) {
    const postData = await getPostData(params.id)

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold my-4 font-lato">{postData.title}</h1>
            <p className="text-gray-500 font-montserrat">{postData.date}</p>
            <div className="mt-4 font-lato markdown-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />

        </div>
    )
}

