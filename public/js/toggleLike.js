$(document).ready(function () {
    $('.like-button').on('click', function () {
        const postId = $(this).data('post-id');
        const likeIcon = $(this).find('.like-icon');
        const likeCount = $(this).siblings('.like-count');
        const likeButton = $(this);

        if (!postId) {
            alert('Post ID not found');
            return;
        }

        likeButton.prop('disabled', true);

        $.ajax({
            url: `/post/like/${postId}`,
            method: 'POST',
            success: function (response) {
                if (response.success) {
                    if (response.liked) {
                        likeIcon.removeClass('fa-regular').addClass('fa-solid');
                    } else {
                        likeIcon.removeClass('fa-solid').addClass('fa-regular');
                    }

                    likeCount.text(response.like_count);
                } else {
                    alert('Error in liking');
                }
            },
            error: function () {
                alert('AJAX request error');
            },
            complete: function () {
                likeButton.prop('disabled', false);
            }
        });
    });
});