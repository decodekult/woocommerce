# User Experience Guidelines: Task list and Inbox 

## Task List & Inbox

Plugins should choose between implementing a Task or Inbox note based on the following guidelines. Avoid implementing both Task and Inbox note for the same message, which adds clutter and reduces the impact of the message.

Use the Task List and Inbox sparingly. Messages should be clear, concise, and maintain a consistent tone. Follow the [Grammar, Punctuation, and Capitalization guide](https://www.google.com/url?q=https://woocommerce.com/document/grammar-punctuation-style-guide/&sa=D&source=editors&ust=1693330746656102&usg=AOvVaw3bYX5mFADFqIMpsW8-owen).

### Task List

![an example of a task in the task list](https://woocommerce.files.wordpress.com/2023/10/task-list1.png)

Anything that **requires** action should go in the task list.

- *What appears in the Things to Do Task List:*

    - Tasks that will enable, connect, or configure an extension.
    - Tasks that are critical to the business, such as capturing payment or responding to disputes.

- *What doesn’t appear in the Things to do Task List:*

    - Any critical update that would impact or prevent the functioning of the store should appear as a top level notice using the standard WordPress component.
    - Informational notices such as feature announcements or tips for using the plugin should appear in the Inbox as they are not critical and do not require action.
    - Notifications from user activity should result in regular feedback notices (success, info, error, warning).

Examples:

![three tasks in the task list under the heading "Things to do next" with the option to expand at the bottom to "show 3 more tasks" ](https://woocommerce.files.wordpress.com/2023/10/task-list-example.png)

### Inbox

The Inbox provides informational, useful, and supplemental content to the user, while important notices and setup tasks have their separate and relevant locations.

![an example of an inbox notification](https://woocommerce.files.wordpress.com/2023/10/inbox1.png)

- *What appears in the Inbox*:
    - Informational notices such as non-critical reminders.
    - Requests for plugin reviews and feedback.
    - Tips for using the plugin and introducing features.
    - Insights such as inspirational messages or milestones.

- *What doesn’t appear in the Inbox*:

    - Notices that require action, extension setup tasks, or regular feedback notices.

Examples:

![an example of two inbox notifications listed under the "Inbox" section of the admin](https://woocommerce.files.wordpress.com/2023/10/inbox-examples.png)
