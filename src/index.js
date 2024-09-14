import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    useBlockProps,
    BlockControls,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl, Spinner, Placeholder } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

registerBlockType('similar-posts/block', {
    title: __('Slične Objave', 'similar-posts-plugin'),
    icon: 'admin-post',
    category: 'widgets',

    attributes: {
        postsToShow: {
            type: 'number',
            default: 2,
        },
    },

    edit: ({ attributes, setAttributes }) => {
        const { postsToShow } = attributes;
        const blockProps = useBlockProps();

        // Dobijanje trenutne objave
        const currentPostId = wp.data.select('core/editor').getCurrentPostId();

        // Dohvatanje sličnih objava
        const similarPosts = useSelect(
            (select) => {
                const { getEntityRecords } = select('core');
                const { getEditedPostAttribute } = select('core/editor');

                const categories = getEditedPostAttribute('categories');

                if (!categories || categories.length === 0) {
                    return [];
                }

                return getEntityRecords('postType', 'post', {
                    per_page: postsToShow,
                    exclude: [currentPostId],
                    categories,
                });
            },
            [postsToShow]
        );

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Podešavanja', 'similar-posts-plugin')}>
                        <RangeControl
                            label={__('Broj objava za prikaz', 'similar-posts-plugin')}
                            value={postsToShow}
                            onChange={(value) => setAttributes({ postsToShow: value })}
                            min={1}
                            max={4}
                        />
                    </PanelBody>
                </InspectorControls>

                {similarPosts ? (
                    similarPosts.length > 0 ? (
                        <ul {...blockProps}>
                            {similarPosts.map((post) => (
                                <li key={post.id}>
                                    <a href={post.link}>{post.title.rendered}</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Placeholder>
                            {__('Nema sličnih objava za prikaz.', 'similar-posts-plugin')}
                        </Placeholder>
                    )
                ) : (
                    <Spinner />
                )}
            </>
        );
    },

    save: () => {
        return null; // Koristimo server-side renderovanje
    },
});
